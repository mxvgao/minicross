#!/usr/bin/env python3

import random
import time

wordlen = 5

def scoring(wordlist):
    matrix = [[0] * 26 for _ in range(wordlen)]
    for word in wordlist:
        for i in range(wordlen):
            idx = ord(word[i]) - ord('a')
            matrix[i][idx] += 1
    return matrix

def rowcheck(word, grid, idx):
    for i in range(wordlen):
        if (grid[idx][i] != '' and grid[idx][i] != word[i]):
            return False
    return True

def colcheck(word, grid, idx):
    for i in range(wordlen):
        if (grid[i][idx] != '' and grid[i][idx] != word[i]):
            return False
    return True

def backtrack(wordlist, grid, filled):
    if sum(filled) == (2 * wordlen):
        return True
    for i, word in enumerate(wordlist):
        for pos in range(2 * wordlen):
            if filled[pos]:
                continue
            if pos < wordlen:
                if not rowcheck(word, grid, pos):
                    continue
            else:
                if not colcheck(word, grid, pos - wordlen):
                    continue
            filled[pos] = 1
            tmp_grid = [row[:] for row in grid]
            if pos < wordlen:
                for j in range(wordlen):
                    grid[pos][j] = word[j]
            else:
                for j in range(wordlen):
                    grid[j][pos - wordlen] = word[j]
            if backtrack(wordlist[:i] + wordlist[i+1:], grid, filled):
                return True
            filled[pos] = 0
            grid[:] = tmp_grid
    return False

def generate_crossword(wordlist):
    random.shuffle(wordlist)
    grid = [[''] * wordlen for _ in range(wordlen)]
    filled = [0] * (2 * wordlen)
    start = time.time()
    if backtrack(wordlist, grid, filled):
        print(grid)
    else:
        print("No crossword found.")
    end = time.time()
    print(f"Elapsed: {end - start:.6f} seconds")

        
def main():
    with open('generator\wordlist.txt', encoding='utf-8') as f:
        text = f.read()
    wordlist = text.split()
    score_mat = scoring(wordlist)
    random.shuffle(wordlist)
    grid = [[''] * wordlen for _ in range(wordlen)]
    filled = [0] * (2 * wordlen)
    start = time.time()
    if backtrack(wordlist, grid, filled):
        print(grid)
    else:
        print("No crossword found.")
    end = time.time()
    print(f"Elapsed: {end - start:.6f} seconds")

if __name__ == "__main__":
    main()