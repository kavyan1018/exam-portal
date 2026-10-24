const dsaQuestions = [
  // Section A: Multiple Choice Questions (5 × 1 = 5 Marks)
  {
    order: 1,
    marks: 1,
    text: 'Section A (Q1.a): Which searching method checks elements one by one?',
    explanation: 'Linear search sequentially checks each element of the list until a match is found or the whole list has been searched.',
    options: [
      { text: 'Binary Search', isCorrect: false },
      { text: 'Linear Search', isCorrect: true },
      { text: 'Selection Sort', isCorrect: false },
      { text: 'Bubble Sort', isCorrect: false }
    ]
  },
  {
    order: 2,
    marks: 1,
    text: 'Section A (Q1.b): Binary Search can be applied directly when the array is:',
    explanation: 'Binary Search requires the array to be sorted in order to eliminate half the search space at each comparison.',
    options: [
      { text: 'Unsorted', isCorrect: false },
      { text: 'Sorted', isCorrect: true },
      { text: 'Empty only', isCorrect: false },
      { text: 'Reversed only', isCorrect: false }
    ]
  },
  {
    order: 3,
    marks: 1,
    text: 'Section A (Q1.c): Which sorting method repeatedly compares adjacent elements?',
    explanation: 'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
    options: [
      { text: 'Selection Sort', isCorrect: false },
      { text: 'Bubble Sort', isCorrect: true },
      { text: 'Binary Search', isCorrect: false },
      { text: 'Linear Search', isCorrect: false }
    ]
  },
  {
    order: 4,
    marks: 1,
    text: 'Section A (Q1.d): In Selection Sort, which element is selected during each pass for ascending order?',
    explanation: 'In Selection Sort for ascending order, the minimum (smallest) element from the unsorted sub-array is selected and placed at the beginning.',
    options: [
      { text: 'Largest element', isCorrect: false },
      { text: 'Smallest element', isCorrect: true },
      { text: 'Middle element', isCorrect: false },
      { text: 'First element only', isCorrect: false }
    ]
  },
  {
    order: 5,
    marks: 1,
    text: 'Section A (Q1.e): Which of the following is a searching technique?',
    explanation: 'Linear Search is a searching technique, whereas Bubble Sort, Selection Sort, and Insertion Sort are sorting algorithms.',
    options: [
      { text: 'Bubble Sort', isCorrect: false },
      { text: 'Selection Sort', isCorrect: false },
      { text: 'Linear Search', isCorrect: true },
      { text: 'Insertion Sort', isCorrect: false }
    ]
  },

  // Section B: Short Answer Questions (5 × 2 = 10 Marks) - NO OPTIONS (Student enters answer)
  {
    order: 6,
    marks: 2,
    text: 'Section B (Q2.a): What is Linear Search? Write its basic steps. (2 Marks)',
    explanation: 'Linear Search sequentially checks each element starting from the first index until the target element is found or the end of the array is reached. Steps: 1. Start from index 0. 2. Compare target with current element. 3. If matched, return index. 4. If end reached without match, return element not found.',
    options: []
  },
  {
    order: 7,
    marks: 2,
    text: 'Section B (Q2.b): What is Binary Search? Why does it require a sorted array? (2 Marks)',
    explanation: 'Binary Search is a divide-and-conquer algorithm that finds target by comparing it with the middle element. It requires a sorted array because the algorithm decides whether to search the left or right sub-array based on whether the target is smaller or larger than the middle element.',
    options: []
  },
  {
    order: 8,
    marks: 2,
    text: 'Section B (Q2.c): Write any two differences between Linear Search and Binary Search. (2 Marks)',
    explanation: '1. Array Order: Linear Search works on unsorted arrays; Binary Search strictly requires a sorted array. 2. Time Complexity: Linear Search takes O(n) time; Binary Search takes O(log n) time.',
    options: []
  },
  {
    order: 9,
    marks: 2,
    text: 'Section B (Q2.d): Explain Bubble Sort with a small example. (2 Marks)',
    explanation: 'Bubble sort repeatedly swaps adjacent out-of-order elements until no swaps are needed, bubbling the largest elements to the end.',
    options: []
  },
  {
    order: 10,
    marks: 2,
    text: 'Section B (Q2.e): Explain Selection Sort with a small example. (2 Marks)',
    explanation: 'Selection sort divides array into sorted and unsorted regions, repeatedly finding the minimum element from the unsorted region and swapping it to the end of the sorted region.',
    options: []
  },

  // Section C: Perform the Following & Sorting Problem (3 × 3M + 1 × 4M = 13 Marks) - NO OPTIONS
  {
    order: 11,
    marks: 3,
    text: 'Section C (Q3.a): Linear Search (3 Marks)\nFind 35 using Linear Search in the array:\n10  25  15  35  40  50\nShow each comparison made step-by-step.',
    explanation: 'Comparison 1: Compare 35 with 10 -> Not equal\nComparison 2: Compare 35 with 25 -> Not equal\nComparison 3: Compare 35 with 15 -> Not equal\nComparison 4: Compare 35 with 35 -> Match found at index 3 (position 4)! Total comparisons = 4.',
    options: []
  },
  {
    order: 12,
    marks: 3,
    text: 'Section C (Q3.b): Binary Search (3 Marks)\nFind 40 using Binary Search in the array:\n10  20  30  40  50  60  70\nShow values of low, mid, and high for each step.',
    explanation: 'Pass 1:\nlow = 0, high = 6\nmid = (0 + 6) / 2 = 3\narr[mid] = arr[3] = 40\nSince arr[mid] == 40, target element is found at index 3 (position 4) in 1 comparison!',
    options: []
  },
  {
    order: 13,
    marks: 3,
    text: 'Section C (Q3.c): Bubble Sort (3 Marks)\nSort the following array in ascending order using Bubble Sort:\n30  10  50  20  40\nShow the state of the array after each pass.',
    explanation: 'Initial: [30, 10, 50, 20, 40]\nPass 1: [10, 30, 20, 40, 50] (50 placed at end)\nPass 2: [10, 20, 30, 40, 50] (40 placed)\nPass 3: [10, 20, 30, 40, 50] (No swaps needed - fully sorted)',
    options: []
  },
  {
    order: 14,
    marks: 4,
    text: 'Section C (Q4): Sorting Problem (4 Marks)\nSort the following array using Selection Sort in ascending order:\n45  20  35  10  50  25\nShow the array after each selection/pass.',
    explanation: 'Initial: [45, 20, 35, 10, 50, 25]\nPass 1: Min is 10 (index 3). Swap with 45 -> [10, 20, 35, 45, 50, 25]\nPass 2: Min is 20 (index 1). Already in place -> [10, 20, 35, 45, 50, 25]\nPass 3: Min is 25 (index 5). Swap with 35 -> [10, 20, 25, 45, 50, 35]\nPass 4: Min is 35 (index 5). Swap with 45 -> [10, 20, 25, 35, 50, 45]\nPass 5: Min is 45 (index 5). Swap with 50 -> [10, 20, 25, 35, 45, 50]',
    options: []
  },

  // Section D: Programming Questions (2 × 6 = 12 Marks) - REAL COMPILER ENABLED - NO OPTIONS
  {
    order: 15,
    marks: 6,
    text: 'Section D (Q5.a): Linear Search Program in C (6 Marks)\nWrite a complete C program to:\n1. Accept n elements into an array.\n2. Accept an element to search.\n3. Search the element using Linear Search.\n4. Display its position if found.\n5. Display "Element Not Found" if it is not present.',
    explanation: '#include <stdio.h>\n\nint main() {\n    int n, key, i, found = 0;\n    if (scanf("%d", &n) != 1 || n <= 0) return 0;\n    int arr[n];\n    for (i = 0; i < n; i++) {\n        scanf("%d", &arr[i]);\n    }\n    scanf("%d", &key);\n    for (i = 0; i < n; i++) {\n        if (arr[i] == key) {\n            printf("Element found at position %d\\n", i + 1);\n            found = 1;\n            break;\n        }\n    }\n    if (!found) {\n        printf("Element Not Found\\n");\n    }\n    return 0;\n}',
    options: []
  },
  {
    order: 16,
    marks: 6,
    text: 'Section D (Q5.b): Bubble Sort Program in C (6 Marks)\nWrite a complete C program to:\n1. Accept n elements into an array.\n2. Display the original array.\n3. Sort the array using Bubble Sort.\n4. Display the sorted array in ascending order.',
    explanation: '#include <stdio.h>\n\nint main() {\n    int n, i, j, temp;\n    if (scanf("%d", &n) != 1 || n <= 0) return 0;\n    int arr[n];\n    for (i = 0; i < n; i++) {\n        scanf("%d", &arr[i]);\n    }\n    printf("Original array: ");\n    for (i = 0; i < n; i++) {\n        printf("%d ", arr[i]);\n    }\n    printf("\\n");\n\n    for (i = 0; i < n - 1; i++) {\n        for (j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                temp = arr[j];\n                arr[j] = arr[j + 1];\n                arr[j + 1] = temp;\n            }\n        }\n    }\n\n    printf("Sorted array: ");\n    for (i = 0; i < n; i++) {\n        printf("%d ", arr[i]);\n    }\n    printf("\\n");\n    return 0;\n}',
    options: []
  }
];

async function createDsaExam() {
  const baseUrl = 'http://localhost:4040';
  console.log(`Authenticating with ${baseUrl}...`);

  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kavvyanfaculty@gmail.com', password: 'kavyan@faculty22' })
  });

  if (!loginRes.ok) {
    throw new Error('Login failed: ' + (await loginRes.text()));
  }

  const { token } = await loginRes.json();
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const myExamsRes = await fetch(`${baseUrl}/api/v1/faculty/exams`, { headers: authHeaders });
  const myExams = await myExamsRes.json();
  const existingExam = myExams.find(e => e.title && e.title.includes('DSA Exam – Searching & Sorting'));

  let examId;
  const examPayload = {
    title: 'DSA Exam – Searching & Sorting',
    description: 'Data Structures & Algorithms Assessment: Searching (Linear, Binary) & Sorting (Bubble, Selection). Total 40 Marks, 1 Hour duration. Covers MCQs, conceptual short answers, trace-table walkthroughs, and complete C program implementations.',
    startWindow: '2026-10-24T00:00:00',
    endWindow: '2026-12-31T23:59:59',
    durationMinutes: 60,
    totalMarks: 40,
    passMarks: 16,
    negativeMarkPerQuestion: 0,
    randomizeQuestions: false,
    randomizeOptions: false,
    maxViolationsAllowed: 3,
    enableWebcam: true,
    status: 'PUBLISHED'
  };

  if (existingExam) {
    console.log(`Found existing DSA exam ID ${existingExam.id}. Re-uploading cleanly...`);
    examId = existingExam.id;
    await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(examPayload)
    });

    const fullExamRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, { headers: authHeaders });
    const fullExam = await fullExamRes.json();
    if (fullExam.questions && fullExam.questions.length > 0) {
      console.log(`Clearing ${fullExam.questions.length} existing questions...`);
      for (const q of fullExam.questions) {
        await fetch(`${baseUrl}/api/v1/faculty/exams/questions/${q.id}`, {
          method: 'DELETE',
          headers: authHeaders
        });
      }
    }
  } else {
    console.log('Creating new exam: DSA Exam – Searching & Sorting...');
    const createRes = await fetch(`${baseUrl}/api/v1/faculty/exams`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(examPayload)
    });
    const created = await createRes.json();
    examId = created.id;
    console.log(`Created exam with ID: ${examId}`);
  }

  console.log(`Uploading ${dsaQuestions.length} questions into Exam ID ${examId}...`);
  let count = 0;
  for (const q of dsaQuestions) {
    const qPayload = {
      questionText: q.text,
      explanation: q.explanation,
      marks: q.marks,
      questionOrder: q.order,
      options: q.options.map((opt, idx) => ({
        optionText: opt.text,
        isCorrect: opt.isCorrect,
        optionOrder: idx + 1
      }))
    };

    const addRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}/questions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(qPayload)
    });

    if (!addRes.ok) {
      console.error(`Error adding Q${q.order}:`, await addRes.text());
    } else {
      count++;
      console.log(`Added Q${q.order} (${q.marks}M) [${count}/${dsaQuestions.length}]`);
    }
  }

  const verifyRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, { headers: authHeaders });
  const finalExam = await verifyRes.json();
  console.log('\n--- DSA EXAM VERIFICATION ---');
  console.log(`Exam ID: ${finalExam.id}`);
  console.log(`Title: ${finalExam.title}`);
  console.log(`Question Count: ${finalExam.questionCount}`);
  console.log(`Total Marks: ${finalExam.totalMarks}`);
  console.log(`Pass Marks: ${finalExam.passMarks}`);
  console.log(`Duration: ${finalExam.durationMinutes} mins`);
  console.log(`Status: ${finalExam.status}`);
}

createDsaExam().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
