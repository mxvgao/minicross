#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>
#include <limits.h>
#include <time.h>

#define WORDLEN 5
#define MAX_WORDS 10000

static char   grid[WORDLEN][WORDLEN];
static bool   filled[2 * WORDLEN];
static bool   used   [MAX_WORDS];
static char  *wordlist[MAX_WORDS];
static int    wordcount = 0;
static uint64_t candidates[2 * WORDLEN][(MAX_WORDS + 63) / 64];
static int    cand_count[2 * WORDLEN];

static char *my_strdup(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p) memcpy(p, s, n);
    return p;
}

bool rowcheck(char *word, int row) {
    for (int i = 0; i < WORDLEN; i++) {
        if (grid[row][i] != '\0' && grid[row][i] != word[i])
            return false;
    }
    return true;
}

bool colcheck(char *word, int col) {
    for (int i = 0; i < WORDLEN; i++) {
        if (grid[i][col] != '\0' && grid[i][col] != word[i])
            return false;
    }
    return true;
}

bool checkslot(char *word, int pos) {
    if (pos < WORDLEN) {
        if (!rowcheck(word, pos)) 
            return false;
    } else {
        if (!colcheck(word, pos - WORDLEN)) 
            return false;
    }
    return true;
}

void update(void) {
    for (int i = 0; i < 2 * WORDLEN; i++) {
        if (filled[i]) continue;
        for (int j = 0; j < wordcount; j++) {
            if (((candidates[i][j / 64] >> (j % 64)) & 1) == 0) continue;
            if (!checkslot(wordlist[j], i) || used[j]) {
                candidates[i][j / 64] &= ~((1ULL) << (j % 64));
                cand_count[i]--;
            }
        }
    }
}

void place(int pos, int i, char *backup, uint64_t old_cands[2 * WORDLEN][(MAX_WORDS + 63) / 64], int old_counts[2 * WORDLEN]) {
    memcpy(old_cands, candidates, sizeof candidates);
    memcpy(old_counts, cand_count, sizeof cand_count);
    filled[pos] = true;
    used[i] = true;
    if (pos < WORDLEN) {
        for (int j = 0; j < WORDLEN; j++) {
            backup[j] = grid[pos][j];
        }
    } else {
        for (int j = 0; j < WORDLEN; j++) {
            backup[j] = grid[j][pos - WORDLEN];
        }
    }
    if (pos < WORDLEN) {
        for (int j = 0; j < WORDLEN; j++)
            grid[pos][j] = wordlist[i][j];
    } else {
        int col = pos - WORDLEN;
        for (int j = 0; j < WORDLEN; j++)
            grid[j][col] = wordlist[i][j];
    }
    update();
}

void undo(int pos, int i, char *backup, uint64_t old_cands[2 * WORDLEN][(MAX_WORDS + 63) / 64], int old_counts[2 * WORDLEN]) {
    memcpy(candidates, old_cands, sizeof candidates);
    memcpy(cand_count, old_counts, sizeof cand_count);
    filled[pos] = false;
    used[i] = false;
    if (pos < WORDLEN) {
        for (int j = 0; j < WORDLEN; j++) {
            grid[pos][j] = backup[j];
        }
    } else {
        for (int j = 0; j < WORDLEN; j++) {
            grid[j][pos - WORDLEN] = backup[j];
        }
    }
}

int pick_slot(void) {
    int min_idx = -1;
    int min_count = INT_MAX;
    for (int i = 0; i < 2 * WORDLEN; i++) {
        if (filled[i]) {
            continue;
        }
        if (cand_count[i] < min_count) {
            min_count = cand_count[i];
            min_idx = i;
        }
    }
    return min_idx;
}

bool backtrack(int placed) {
    /* check if we're done */
    if (placed == 2 * WORDLEN) 
        return true;
    int pos = pick_slot();
    if (pos < 0) return true;
    if (cand_count[pos] == 0) return false;
    /* loop through each word */
    for (int i = 0; i < (wordcount + 63)/64; i++) {
        uint64_t curblock = candidates[pos][i];
        while (curblock != 0) {
            int firstbit = __builtin_ctzll(curblock);
            int idx = i*64 + firstbit;
            curblock &= curblock - 1;
            if (used[idx]) continue;

            char backup[WORDLEN];
            uint64_t old_cands[2 * WORDLEN][(MAX_WORDS + 63) / 64];
            int old_counts[2 * WORDLEN];
            place(pos, idx, backup, old_cands, old_counts);
            
            if (backtrack(placed + 1))
                return true;

            undo(pos, idx, backup, old_cands, old_counts);
        }
    }
    return false;
}

char* generate(void) {
    // read wordlist
    FILE *f = fopen("wordlist.txt", "r");
    if (!f) {
        for (int i = 0; i < wordcount; i++) free(wordlist[i]);
        return NULL;
    }
    char buf[256];
    while (fscanf(f, "%255s", buf) == 1) {
        if ((int)strlen(buf) == WORDLEN && wordcount < MAX_WORDS) {
            wordlist[wordcount++] = my_strdup(buf);
        }
    }
    fclose(f);

    // shuffle
    srand((unsigned)time(NULL));
    for (int i = 0; i < wordcount - 1; i++) {
        int j = i + rand() % (wordcount - i);
        char *tmp = wordlist[i];
        wordlist[i] = wordlist[j];
        wordlist[j] = tmp;
    }

    // init
    memset(grid, 0, sizeof(grid));
    memset(filled, 0, sizeof(filled));
    memset(used, 0, sizeof(used));

    for (int i = 0; i < 2 * WORDLEN; i++){
        cand_count[i] = wordcount;
        for (int j = 0; j < (wordcount + 63)/64; j++)
            candidates[i][j] = ~0ULL;
        if (wordcount % 64 != 0) {
            candidates[i][((wordcount + 63)/64)-1] = (1ULL << (wordcount % 64)) - 1;
        }
    }

    // backtrack
    bool ok = backtrack(0);

    // freeing
    for (int i = 0; i < wordcount; i++)
        free(wordlist[i]);

    // return
    char *res = malloc(WORDLEN*WORDLEN + 1);
    if (ok && res != NULL) { // oom check
        for (int i = 0; i < WORDLEN; i++) {
            for (int j = 0; j < WORDLEN; j++)
                res[i * WORDLEN + j] = grid[i][j];
        }
    } else {
        return NULL;
    }
    res[WORDLEN * WORDLEN] = '\0';
    return res;
}