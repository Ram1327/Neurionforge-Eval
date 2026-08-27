import type { CodingItem } from "./types";

export const codingItems: CodingItem[] = [
  {
    id: "c001",
    prompt: `What does this Python function return when called as square(4)?

\`\`\`python
def square(x):
    return x * x
\`\`\`

Answer with only the return value, nothing else.`,
    answer: "16", difficulty: "easy",
  },
  {
    id: "c002",
    prompt: `What does this Python code print?

\`\`\`python
nums = [1, 2, 3, 4, 5]
print(sum(nums))
\`\`\`

Answer with only the output, nothing else.`,
    answer: "15", difficulty: "easy",
  },
  {
    id: "c003",
    prompt: `What is the output of the following Python code?

\`\`\`python
s = "hello"
print(s[::-1])
\`\`\`

Answer with only the output, nothing else.`,
    answer: "olleh", difficulty: "easy",
  },
  {
    id: "c004",
    prompt: `What does this function return when called as count_vowels("programming")?

\`\`\`python
def count_vowels(s):
    return sum(1 for c in s if c in "aeiou")
\`\`\`

Answer with only the return value, nothing else.`,
    answer: "3", difficulty: "easy",
  },
  {
    id: "c005",
    prompt: `What is the output of this Python code?

\`\`\`python
x = [1, 2, 3]
x.append(4)
x.pop(0)
print(x)
\`\`\`

Answer with only the output, nothing else.`,
    answer: "[2, 3, 4]", difficulty: "easy",
  },
  {
    id: "c006",
    prompt: `What does this recursive function return when called as factorial(5)?

\`\`\`python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
\`\`\`

Answer with only the return value, nothing else.`,
    answer: "120", difficulty: "easy",
  },
  {
    id: "c007",
    prompt: `What is the output of this Python snippet?

\`\`\`python
d = {"a": 1, "b": 2, "c": 3}
print(sum(d.values()))
\`\`\`

Answer with only the output, nothing else.`,
    answer: "6", difficulty: "easy",
  },
  {
    id: "c008",
    prompt: `What does this function return when called as is_palindrome("racecar")?

\`\`\`python
def is_palindrome(s):
    return s == s[::-1]
\`\`\`

Answer with only the return value (True or False), nothing else.`,
    answer: "True", difficulty: "easy",
  },
  {
    id: "c009",
    prompt: `What is the output of this code?

\`\`\`python
result = [x**2 for x in range(1, 5)]
print(result)
\`\`\`

Answer with only the output, nothing else.`,
    answer: "[1, 4, 9, 16]", difficulty: "medium",
  },
  {
    id: "c010",
    prompt: `What does this function return when called as flatten([1, [2, 3], [4, [5]]])?

\`\`\`python
def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result
\`\`\`

Answer with only the return value, nothing else.`,
    answer: "[1, 2, 3, 4, 5]", difficulty: "medium",
  },
  {
    id: "c011",
    prompt: `What is the output of this Python code?

\`\`\`python
a = [1, 2, 3]
b = a
b.append(4)
print(len(a))
\`\`\`

Answer with only the output, nothing else.`,
    answer: "4", difficulty: "medium",
  },
  {
    id: "c012",
    prompt: `What does this function return when called as binary_search([1,3,5,7,9,11], 7)?

\`\`\`python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
\`\`\`

Answer with only the return value, nothing else.`,
    answer: "3", difficulty: "medium",
  },
  {
    id: "c013",
    prompt: `What is the output of this Python code?

\`\`\`python
def mystery(n):
    if n == 0:
        return 0
    if n == 1:
        return 1
    return mystery(n-1) + mystery(n-2)

print(mystery(7))
\`\`\`

Answer with only the output, nothing else.`,
    answer: "13", difficulty: "medium",
  },
  {
    id: "c014",
    prompt: `What does this generator expression evaluate to?

\`\`\`python
result = list(filter(lambda x: x % 2 == 0, range(10)))
print(result)
\`\`\`

Answer with only the output, nothing else.`,
    answer: "[0, 2, 4, 6, 8]", difficulty: "medium",
  },
  {
    id: "c015",
    prompt: `What is the output of this Python code?

\`\`\`python
s = "the quick brown fox"
words = s.split()
print(len(words))
\`\`\`

Answer with only the output, nothing else.`,
    answer: "4", difficulty: "easy",
  },
  {
    id: "c016",
    prompt: `What does this function return when called as max_subarray([-2,1,-3,4,-1,2,1,-5,4])?

\`\`\`python
def max_subarray(nums):
    max_sum = nums[0]
    current = nums[0]
    for n in nums[1:]:
        current = max(n, current + n)
        max_sum = max(max_sum, current)
    return max_sum
\`\`\`

Answer with only the return value, nothing else.`,
    answer: "6", difficulty: "hard",
  },
  {
    id: "c017",
    prompt: `What is the output of this Python code?

\`\`\`python
x = {"a": [1, 2], "b": [3, 4]}
x["a"].append(3)
print(x["a"])
\`\`\`

Answer with only the output, nothing else.`,
    answer: "[1, 2, 3]", difficulty: "easy",
  },
  {
    id: "c018",
    prompt: `What does this code output?

\`\`\`python
class Counter:
    count = 0
    def increment(self):
        Counter.count += 1

c1 = Counter()
c2 = Counter()
c1.increment()
c2.increment()
print(Counter.count)
\`\`\`

Answer with only the output, nothing else.`,
    answer: "2", difficulty: "medium",
  },
  {
    id: "c019",
    prompt: `What does this function return when called as find_duplicates([1, 2, 3, 2, 4, 3, 5])?

\`\`\`python
def find_duplicates(lst):
    seen = set()
    dups = []
    for x in lst:
        if x in seen and x not in dups:
            dups.append(x)
        seen.add(x)
    return sorted(dups)
\`\`\`

Answer with only the return value, nothing else.`,
    answer: "[2, 3]", difficulty: "medium",
  },
  {
    id: "c020",
    prompt: `What is the output of this Python code?

\`\`\`python
import functools
nums = [1, 2, 3, 4, 5]
result = functools.reduce(lambda a, b: a * b, nums)
print(result)
\`\`\`

Answer with only the output, nothing else.`,
    answer: "120", difficulty: "medium",
  },
  {
    id: "c021",
    prompt: `What does this code print?

\`\`\`python
def make_adder(n):
    def adder(x):
        return x + n
    return adder

add5 = make_adder(5)
print(add5(3))
\`\`\`

Answer with only the output, nothing else.`,
    answer: "8", difficulty: "medium",
  },
  {
    id: "c022",
    prompt: `What is the output of this Python code?

\`\`\`python
matrix = [[1,2,3],[4,5,6],[7,8,9]]
flat = [num for row in matrix for num in row]
print(flat[4])
\`\`\`

Answer with only the output, nothing else.`,
    answer: "5", difficulty: "medium",
  },
  {
    id: "c023",
    prompt: `What does this function return when called as is_prime(17)?

\`\`\`python
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True
\`\`\`

Answer with only the return value (True or False), nothing else.`,
    answer: "True", difficulty: "easy",
  },
  {
    id: "c024",
    prompt: `What is the output of this Python code?

\`\`\`python
from collections import Counter
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
c = Counter(words)
print(c.most_common(1)[0][1])
\`\`\`

Answer with only the output, nothing else.`,
    answer: "3", difficulty: "medium",
  },
  {
    id: "c025",
    prompt: `What does this function return when called as rotate([1,2,3,4,5], 2)?

\`\`\`python
def rotate(lst, k):
    k = k % len(lst)
    return lst[-k:] + lst[:-k]
\`\`\`

Answer with only the return value, nothing else.`,
    answer: "[4, 5, 1, 2, 3]", difficulty: "hard",
  },
];
