#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

#define WORDLEN 5
#define MAX_WORDS 10000

static char   grid[WORDLEN][WORDLEN];
static bool   filled[2 * WORDLEN];
static bool   used   [MAX_WORDS];
static char  *wordlist[MAX_WORDS];
static int    wordcount = 0;

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

void place(int pos, int i, char *backup, char *w) {
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
            grid[pos][j] = w[j];
    } else {
        int col = pos - WORDLEN;
        for (int j = 0; j < WORDLEN; j++)
            grid[j][col] = w[j];
    }
}

void undo(int pos, int i, char *backup) {
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

bool backtrack(int placed) {
    /* check if we're done */
    if (placed == 2 * WORDLEN) 
        return true;
    /* loop through each word */
    for (int i = 0; i < wordcount; i++) {
        /* check if used already */
        if (used[i]) 
            continue;
        char *w = wordlist[i];

        for (int pos = 0; pos < 2 * WORDLEN; pos++) {

            if (filled[pos]) 
                continue;

            if (!checkslot(w, pos)) {
                continue;
            }

            char backup[WORDLEN];
            place(pos, i, backup, w);

            if (backtrack(placed + 1))
                return true;

            undo(pos, i, backup);
        }
    }
    return false;
}

int main(void) {
    /* 1) Read in wordlist */
    FILE *f = fopen("wordlist.txt", "r");
    if (!f) {
        perror("Failed to open wordlist");
        return 1;
    }
    char buf[256];
    while (fscanf(f, "%255s", buf) == 1) {
        if ((int)strlen(buf) == WORDLEN && wordcount < MAX_WORDS) {
            wordlist[wordcount++] = my_strdup(buf);
        }
    }
    fclose(f);

    /* 2) Shuffle */
    srand((unsigned)time(NULL));
    for (int i = 0; i < wordcount - 1; i++) {
        int j = i + rand() % (wordcount - i);
        char *tmp = wordlist[i];
        wordlist[i] = wordlist[j];
        wordlist[j] = tmp;
    }

    /* 3) Init */
    memset(grid,   0, sizeof(grid));
    memset(filled, 0, sizeof(filled));
    memset(used,   0, sizeof(used));

    /* 4) Backtrack & time it */
    clock_t t0 = clock();
    bool ok = backtrack(0);
    clock_t t1 = clock();

    /* 5) Print result */
    if (ok) {
        for (int i = 0; i < WORDLEN; i++) {
            for (int j = 0; j < WORDLEN; j++)
                putchar(grid[i][j] ? grid[i][j] : '.');
            putchar('\n');
        }
    } else {
        printf("No crossword found.\n");
    }
    printf("Elapsed: %.6f seconds\n",
           (double)(t1 - t0) / CLOCKS_PER_SEC);

    /* 6) Cleanup */
    for (int i = 0; i < wordcount; i++)
        free(wordlist[i]);

    return 0;
}