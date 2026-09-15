import { Terminal, Zap, Calculator, Leaf, Radio, Cpu, Book, Code, Atom, Database, Activity } from 'lucide-react';

export const masterSubjects = {
  year1: {
    title: 'First Year',
    semesters: {
      1: [
        { code: 'CS1139', name: 'Programming 1 (Python)', icon: Terminal, desc: 'Introductory programming, control flow, functions, lists, and file handling.', hasLab: true },
        { code: 'EE1118', name: 'Electrical and Electronics Engineering (EEE)', icon: Cpu, desc: 'DC circuits, KVL/KCL, network theorems, AC circuits, and semiconductor diodes.' },
        { code: 'AS1109', name: 'Calculus', icon: Calculator, desc: 'Limits, continuity, single variable differentiation, integration, and infinite series.' },
        { code: 'AS1108', name: 'Applied Physics', icon: Zap, desc: 'Wave optics, interference, diffraction, polarization, and quantum mechanics.' },
        { code: 'ES1115', name: 'Environmental Science and Sustainability', icon: Leaf, desc: 'Ecosystems, biodiversity, pollution control, global warming, and sustainable dev.' },
        { code: 'CC1101', name: 'Fundamental of Communication', icon: Radio, desc: 'Basics of signals, modulation techniques (AM/FM), and data transmission systems.' },
        { code: 'IL1107', name: 'Introduction to Indian Knowledge System (IKS)', icon: Book, desc: 'Overview of ancient Indian sciences, philosophy, mathematics, and holistic wellness.' }
      ],
      2: [
        { code: 'CS1135', name: 'Programming 2 (C)', icon: Code, desc: 'Advanced programming in C, pointers, memory management, and data structures.', hasLab: true },
        { code: 'EE1125', name: 'Digital Electronics', icon: Cpu, desc: 'Logic gates, Boolean algebra, combinational and sequential circuits, and microprocessors.' },
        { code: 'AS1114', name: 'Linear Algebra and differential Equations', icon: Calculator, desc: 'Matrices, vector spaces, eigenvalues, and ordinary differential equations.' },
        { code: 'CC1102', name: 'Critical thinking and Storytelling', icon: Book, desc: 'Developing critical thinking skills and the art of effective storytelling.' },
        { code: 'AS1108', name: 'Applied Physics', icon: Zap, desc: 'Wave optics, interference, diffraction, polarization, and quantum mechanics.' },
        { code: 'IL1107', name: 'Introduction to Indian Knowledge System (IKS)', icon: Book, desc: 'Overview of ancient Indian sciences, philosophy, mathematics, and holistic wellness.' }
      ]
    }
  },
  year2: {
    title: 'Second Year',
    semesters: {
      3: [
        { code: 'CS1131', name: 'Data Structure and Algorithms', icon: Code, desc: 'Advanced data structures, algorithm analysis, and problem-solving techniques.', hasLab: true },
        { code: 'CS1134', name: 'Computer Organization and Architecture', icon: Cpu, desc: 'Computer architecture, memory hierarchy, CPU design, and instruction sets.' },
        { code: 'CS1133', name: 'Database Management Systems', icon: Database, desc: 'Relational databases, SQL, normal forms, and transaction management.' },
        { code: 'CS1141', name: 'Discrete Mathematics', icon: Calculator, desc: 'Logic, sets, relations, functions, graphs, and combinatorial mathematics.' },
        { code: 'LS1108', name: 'Essentials of Business Management', icon: Book, desc: 'Fundamental concepts of business operations, management, and strategy.' },
        { code: 'CC1103', name: 'Perspectives on Contemporary Issues', icon: Radio, desc: 'Analyzing and discussing modern societal, ethical, and global challenges.' }
      ],
      4: [
        { code: 'CS1105', name: 'Design and Analysis of Algorithms', icon: Code, desc: 'Algorithm design paradigms, complexity classes, and advanced graph algorithms.', hasLab: true },
        { code: 'CS1138', name: 'Machine Learning', icon: Atom, desc: 'Supervised and unsupervised learning, neural networks, and predictive modeling.' },
        { code: 'CS1108', name: 'Operating Systems', icon: Terminal, desc: 'Process management, memory management, file systems, and concurrency.' },
        { code: 'AS2170', name: 'Probability and Statistics', icon: Activity, desc: 'Probability distributions, statistical inference, hypothesis testing, and regression.' },
        { code: 'LS1109', name: 'Managing Business Functions', icon: Book, desc: 'Deep dive into marketing, finance, human resources, and operations management.' },
        { code: 'CC1104', name: 'Communication and Identity', icon: Radio, desc: 'Understanding personal and professional identity through effective communication.' }
      ]
    }
  },
  year3: {
    title: 'Third Year',
    branches: {
      core: [
        { code: 'CS1224', name: 'Artificial Intelligence', icon: Zap, desc: 'Intro to AI, search algorithms, logic, and problem solving.' },
        { code: 'CS1140', name: 'Computer Networks', icon: Radio, desc: 'Network layers, TCP/IP, routing protocols, and network security.' },
        { code: 'CS1261', name: 'Principles of Cloud computing', icon: Database, desc: 'Cloud architectures, virtualization, AWS/Azure, and containerization.' },
        { code: 'CS1243', name: 'Big Data Analytics with Hadoop and Spark', icon: Activity, desc: 'HDFS, MapReduce, Spark ecosystem, and data processing.' },
        { code: 'CS1259', name: 'Introduction to Data Science', icon: Activity, desc: 'Data cleaning, EDA, statistical modeling, and data visualization.' },
        { code: 'EE1232', name: 'Digital Image Processing', icon: Cpu, desc: 'Image enhancement, filtering, segmentation, and feature extraction.' },
        { code: 'FA1201', name: 'Computational Finance', icon: Calculator, desc: 'Financial modeling, risk analysis, pricing options, and algorithmic trading.' },
        { code: 'AS1118', name: 'Advanced Differential Equations', icon: Calculator, desc: 'Partial differential equations, boundary value problems, and Fourier series.' },
        { code: 'AS1209', name: 'Matrix Computations', icon: Calculator, desc: 'Numerical linear algebra, eigenvalue problems, and singular value decomposition.' },
        { code: 'ED1112', name: 'Entrepreneurship Development', icon: Book, desc: 'Business planning, startup ecosystem, innovation, and venture funding.' },
        { code: 'AS1202', name: 'Advanced Statistics', icon: Activity, desc: 'Multivariate analysis, ANOVA, non-parametric tests, and stochastic processes.' },
        { code: 'CS1142', name: 'Discrete Mathematics', icon: Calculator, desc: 'Logic, sets, relations, functions, graphs, and combinatorial mathematics.' }
      ],
      ai: [
        { code: 'CS1224', name: 'Artificial Intelligence', icon: Zap, desc: 'Intro to AI, search algorithms, logic, and problem solving.' },
        { code: 'CS1218', name: 'Deep Learning', icon: Atom, desc: 'Neural networks, CNNs, RNNs, optimization, and generative models.' },
        { code: 'CS1261', name: 'Principles of Cloud computing', icon: Database, desc: 'Cloud architectures, virtualization, AWS/Azure, and containerization.' },
        { code: 'CS1243', name: 'Big Data Analytics with Hadoop and Spark', icon: Activity, desc: 'HDFS, MapReduce, Spark ecosystem, and data processing.' },
        { code: 'CS1259', name: 'Introduction to Data Science', icon: Activity, desc: 'Data cleaning, EDA, statistical modeling, and data visualization.' },
        { code: 'EE1232', name: 'Digital Image Processing', icon: Cpu, desc: 'Image enhancement, filtering, segmentation, and feature extraction.' },
        { code: 'FA1201', name: 'Computational Finance', icon: Calculator, desc: 'Financial modeling, risk analysis, pricing options, and algorithmic trading.' },
        { code: 'AS1118', name: 'Advanced Differential Equations', icon: Calculator, desc: 'Partial differential equations, boundary value problems, and Fourier series.' },
        { code: 'AS1209', name: 'Matrix Computations', icon: Calculator, desc: 'Numerical linear algebra, eigenvalue problems, and singular value decomposition.' },
        { code: 'ED1112', name: 'Entrepreneurship Development', icon: Book, desc: 'Business planning, startup ecosystem, innovation, and venture funding.' },
        { code: 'AS1202', name: 'Advanced Statistics', icon: Activity, desc: 'Multivariate analysis, ANOVA, non-parametric tests, and stochastic processes.' },
        { code: 'CS1142', name: 'Discrete Mathematics', icon: Calculator, desc: 'Logic, sets, relations, functions, graphs, and combinatorial mathematics.' }
      ]
    }
  },
  year4: {
    title: 'Fourth Year',
    branches: {
      core: [],
      ai: []
    }
  }
};

export const getAllSubjects = () => {
  const all = [];
  Object.values(masterSubjects).forEach(year => {
    if (year.semesters) {
      Object.values(year.semesters).forEach(sem => {
        all.push(...sem);
      });
    }
    if (year.branches) {
      Object.values(year.branches).forEach(branchSubs => {
        // Prevent duplicate objects since core and ai share some subjects
        branchSubs.forEach(sub => {
          if (!all.some(s => s.code === sub.code)) {
            all.push(sub);
          }
        });
      });
    }
  });
  return all;
};

export const getSemesterForSubject = (subjectCode) => {
  for (const [yearKey, year] of Object.entries(masterSubjects)) {
    if (year.semesters) {
      for (const [semNum, subjects] of Object.entries(year.semesters)) {
        if (subjects.some(s => s.code === subjectCode)) {
          return semNum;
        }
      }
    }
    if (year.branches) {
      for (const [branchName, subjects] of Object.entries(year.branches)) {
        if (subjects.some(s => s.code === subjectCode)) {
          // Returning hash path for branch
          const yearNum = yearKey.replace('year', '');
          return `year-${yearNum}-${branchName}`;
        }
      }
    }
  }
  return null;
};
