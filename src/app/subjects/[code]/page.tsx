import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";
import { Download, FileText, BookOpen, Lightbulb } from "lucide-react";
import Link from "next/link";

export default async function SubjectPage({
  params,
}: {
  params: { code: string };
}) {
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to login
  if (!session) {
    redirect("/login");
  }

  const code = params.code.toUpperCase();

  // In a real app, you would fetch this from DB. We'll use mock data to match UI.
  const subjectMap: Record<string, { name: string; category: string }> = {
    CSF101: { name: "Programming-I", category: "CORE" },
    EEE101: { name: "Electrical & Electronics", category: "ENGINEERING" },
    MTH101: { name: "Calculus", category: "MATH" },
    ENV101: { name: "Environment & Sustainability", category: "HUMANITIES" },
    COM101: { name: "Communication", category: "SKILLS" },
    DES101: { name: "Design Creativity", category: "DESIGN" },
  };

  const subject = subjectMap[code];

  if (!subject) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center">
        <Header />
        <main className="flex-1 w-full max-w-7xl px-8 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Subject Not Found</h1>
          <Link href="/" className="text-primary hover:underline">Return Home</Link>
        </main>
      </div>
    );
  }

  // Fetch documents from DB (currently empty as we just set up SQLite)
  const documents = await prisma.document.findMany({
    where: { subject: { code: code } },
  });

  // Mock some documents to show how it looks
  const mockDocs = [
    { id: "1", title: "Midterm Exam 2024", type: "EXAM_PAPER", date: "Oct 2024" },
    { id: "2", title: "Midterm Solution 2024", type: "SOLUTION", date: "Oct 2024" },
    { id: "3", title: "Chapter 1-3 Notes", type: "NOTES", date: "Aug 2024" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "EXAM_PAPER": return <FileText className="w-6 h-6 text-orange-500" />;
      case "SOLUTION": return <Lightbulb className="w-6 h-6 text-green-500" />;
      case "NOTES": return <BookOpen className="w-6 h-6 text-blue-500" />;
      default: return <FileText className="w-6 h-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <Header />

      <main className="flex-1 w-full max-w-7xl px-8 py-12">
        <div className="mb-12 border-b border-border/50 pb-8">
          <span className="text-sm font-bold tracking-widest text-primary uppercase mb-2 block">
            {subject.category} • {code}
          </span>
          <h1 className="text-5xl font-playfair font-bold text-foreground">
            {subject.name}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl">
            Access past papers, detailed solutions, and comprehensive notes to ace your exams.
          </p>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Available Resources</h2>
          
          {mockDocs.map((doc) => (
            <div
              key={doc.id}
              className="group bg-card border border-border/50 hover:border-primary/50 rounded-2xl p-6 flex items-center justify-between transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-background rounded-full group-hover:scale-110 transition-transform">
                  {getIcon(doc.type)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium px-2 py-1 bg-secondary rounded-md text-xs">
                      {doc.type.replace("_", " ")}
                    </span>
                    <span>{doc.date}</span>
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-full font-medium transition-colors">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}

          {documents.length > 0 && documents.map((doc) => (
            <div
              key={doc.id}
              className="group bg-card border border-border/50 hover:border-primary/50 rounded-2xl p-6 flex items-center justify-between transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-background rounded-full group-hover:scale-110 transition-transform">
                  {getIcon(doc.type)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium px-2 py-1 bg-secondary rounded-md text-xs">
                      {doc.type.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-full font-medium transition-colors">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
