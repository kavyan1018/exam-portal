const { questions } = require('./seed_css_exam');

async function main() {
  const baseUrl = 'http://localhost:4040';
  console.log(`Connecting to ${baseUrl}...`);

  // 1. Login as Faculty
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kavvyanfaculty@gmail.com', password: 'kavyan@faculty22' })
  });

  if (!loginRes.ok) {
    const err = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${err}`);
  }

  const { token } = await loginRes.json();
  console.log('Faculty logged in successfully. Token acquired.');

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Fetch Exam 2 details
  const examId = 2;
  const examRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, { headers: authHeaders });
  if (!examRes.ok) {
    throw new Error(`Failed to fetch exam ${examId}: ${await examRes.text()}`);
  }
  const exam = await examRes.json();
  console.log(`Target Exam: [ID: ${exam.id}] "${exam.title}"`);
  console.log(`Current Questions count: ${exam.questionCount || 0}`);

  // 3. If any questions already exist, delete them first to avoid duplicate additions
  if (exam.questions && exam.questions.length > 0) {
    console.log(`Removing ${exam.questions.length} existing questions...`);
    for (const q of exam.questions) {
      await fetch(`${baseUrl}/api/v1/faculty/exams/questions/${q.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
    }
    console.log('Cleared existing questions.');
  }

  // 4. Update Exam settings: 120 minutes, 100 total marks, 40 pass marks, sequential order
  const now = new Date();
  const startWindow = "2026-10-23T00:00:00";
  const endWindow = "2026-12-31T23:59:59";

  const updatePayload = {
    title: "CSS_Final_Exam",
    description: "Subject: CSS (Cascading Style Sheets) | Duration: 2 Hours | Total Marks: 100\nSections: Section A (MCQs 20M), Section B (Short Answers 20M), Section C (Coding Tasks 20M), Section D (Practical 20M), Section E (Design Challenge 20M). Attempt all questions.",
    startWindow: startWindow,
    endWindow: endWindow,
    durationMinutes: 120,
    totalMarks: 100,
    passMarks: 40,
    negativeMarkPerQuestion: 0,
    randomizeQuestions: false,
    randomizeOptions: false,
    maxViolationsAllowed: 3,
    enableWebcam: true,
    status: "PUBLISHED"
  };

  console.log('Updating exam metadata (duration 120m, 100 marks, published)...');
  const updateRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify(updatePayload)
  });
  if (!updateRes.ok) {
    console.error('Warning: could not update exam metadata:', await updateRes.text());
  } else {
    console.log('Exam metadata updated successfully.');
  }

  // 5. Upload all 37 questions
  console.log(`Uploading ${questions.length} questions...`);
  let uploaded = 0;
  for (const q of questions) {
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
      const err = await addRes.text();
      console.error(`Failed to add Question ${q.order}:`, err);
    } else {
      uploaded++;
      process.stdout.write(`Uploaded Q${q.order} (${q.marks}M) [${uploaded}/${questions.length}]\r`);
    }
  }

  console.log(`\nSuccessfully uploaded ${uploaded} / ${questions.length} questions!`);

  // 6. Verify Final Exam Status
  const verifyRes = await fetch(`${baseUrl}/api/v1/faculty/exams/${examId}`, { headers: authHeaders });
  const updatedExam = await verifyRes.json();
  console.log('\n--- VERIFICATION ---');
  console.log(`Exam ID: ${updatedExam.id}`);
  console.log(`Title: ${updatedExam.title}`);
  console.log(`Duration: ${updatedExam.durationMinutes} minutes`);
  console.log(`Question Count: ${updatedExam.questionCount}`);
  console.log(`Total Marks: ${updatedExam.totalMarks}`);
  console.log(`Pass Marks: ${updatedExam.passMarks}`);
  console.log(`Status: ${updatedExam.status}`);
}

main().catch(err => {
  console.error("Script execution failed:", err);
  process.exit(1);
});
