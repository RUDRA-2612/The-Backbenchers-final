import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch all students
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <Header />

      <main className="flex-1 w-full max-w-7xl px-8 py-12">
        <div className="mb-12 border-b border-border/50 pb-6">
          <h1 className="text-4xl font-playfair font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage students, subjects, and exam resources.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            {/* Upload PDF Section */}
            <section className="bg-card border border-border/50 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Upload Document
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1 ml-1">
                      Subject
                    </label>
                    <select className="w-full px-4 py-3 rounded-2xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
                      <option value="">Select Subject</option>
                      <option value="CSF101">Programming-I (CSF101)</option>
                      <option value="EEE101">Electrical (EEE101)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1 ml-1">
                      Document Type
                    </label>
                    <select className="w-full px-4 py-3 rounded-2xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground">
                      <option value="EXAM_PAPER">Exam Paper</option>
                      <option value="SOLUTION">Solution</option>
                      <option value="NOTES">Notes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1 ml-1">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Midterm 2025"
                    className="w-full px-4 py-3 rounded-2xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1 ml-1">
                    PDF File
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    className="w-full px-4 py-3 rounded-2xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-all shadow-md w-full"
                >
                  Upload Document
                </button>
              </form>
            </section>
          </div>

          {/* Sidebar / Students List */}
          <div className="space-y-12">
            <section className="bg-card border border-border/50 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Registered Students
              </h2>
              <div className="space-y-4">
                {students.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No students registered yet.
                  </p>
                ) : (
                  students.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 rounded-2xl bg-background border border-border/50"
                    >
                      <p className="font-semibold text-foreground">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {student.email}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
