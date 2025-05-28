# testing generator on a known crossword

from gen import generate_crossword

words = ["firms","lasso","cheek","horse","smoke",
         "idiom","filch","idaho","riser","moses"]

grid = generate_crossword(words)