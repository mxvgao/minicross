#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

#define WORDLEN    5
#define MAX_WORDS 10000

/* The grid and helper arrays */
static char   grid[WORDLEN][WORDLEN];
static bool   filled[2 * WORDLEN];    // which row/col slots are taken
static bool   used   [MAX_WORDS];     // which words we’ve placed
static char  *wordlist[MAX_WORDS];
static int    wordcount = 0;

/* Duplicate strdup in case it’s not available */
static char *my_strdup(const char *s) {
    size_t n = strlen(s) + 1;
    char *p = malloc(n);
    if (p) memcpy(p, s, n);
    return p;
}

bool rowcheck(const char *word, int row) {
    for (int i = 0; i < WORDLEN; i++) {
        if (grid[row][i] != '\0' && grid[row][i] != word[i])
            return false;
    }
    return true;
}

bool colcheck(const char *word, int col) {
    for (int i = 0; i < WORDLEN; i++) {
        if (grid[i][col] != '\0' && grid[i][col] != word[i])
            return false;
    }
    return true;
}

bool backtrack(int placed) {
    if (placed == 2 * WORDLEN) 
        return true;

    for (int i = 0; i < wordcount; i++) {
        if (used[i]) 
            continue;
        const char *w = wordlist[i];

        for (int pos = 0; pos < 2 * WORDLEN; pos++) {
            if (filled[pos]) 
                continue;

            /* can it go in this slot? */
            if (pos < WORDLEN) {
                if (!rowcheck(w, pos)) 
                    continue;
            } else {
                if (!colcheck(w, pos - WORDLEN)) 
                    continue;
            }

            /* place it */
            filled[pos] = true;
            used[i]    = true;
            char backup[WORDLEN][WORDLEN];
            memcpy(backup, grid, sizeof(grid));

            if (pos < WORDLEN) {
                for (int j = 0; j < WORDLEN; j++)
                    grid[pos][j] = w[j];
            } else {
                for (int j = 0; j < WORDLEN; j++)
                    grid[j][pos - WORDLEN] = w[j];
            }

            /* recurse */
            if (backtrack(placed + 1))
                return true;

            /* undo */
            filled[pos] = false;
            used[i]     = false;
            memcpy(grid, backup, sizeof(grid));
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

