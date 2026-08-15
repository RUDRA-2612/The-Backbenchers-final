import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Header } from "@/components/header";

export default function Home() {
  const subjects = [
    {
      name: "Programming-I",
      category: "CORE",
      code: "CSF101",
    },
    {
      name: "Electrical & Electronics",
      category: "ENGINEERING",
      code: "EEE101",
    },
    {
      name: "Calculus",
      category: "MATH",
      code: "MTH101",
    },
    {
      name: "Environment & Sustainability",
      category: "HUMANITIES",
      code: "ENV101",
    },
    {
      name: "Communication",
      category: "SKILLS",
      code: "COM101",
    },
    {
      name: "Design Creativity",
      category: "DESIGN",
      code: "DES101",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <Header />

      {/* HERO SECTION */}
      <main className="flex-1 w-full max-w-7xl px-8 flex flex-col items-center mt-20 md:mt-32">
        <div className="flex flex-col items-center text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            V1.0 is now live
          </div>
          <h1 className="text-6xl md:text-8xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic mb-6">
            The Backbenchers
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
            Your ultimate academic companion. Access curated notes, previous year papers, and essential resources for your engineering journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-primary hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.6)] flex items-center justify-center gap-2 group hover:-translate-y-0.5"
            >
              Start Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#subjects"
              className="w-full sm:w-auto text-foreground hover:text-primary font-medium transition-colors flex items-center justify-center gap-2 group px-8 py-3.5 bg-secondary/50 rounded-full hover:bg-secondary"
            >
              Preview Subjects
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform -rotate-45" />
            </Link>
          </div>
        </div>

        {/* SUBJECTS SECTION */}
        <div id="subjects" className="w-full mt-32 mb-20">
          <div className="mb-10">
            <h2 className="text-5xl font-bold text-foreground mb-4">Subjects</h2>
            <p className="text-muted-foreground text-lg">
              First-year curriculum. More semesters coming soon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <Link
                href={`/subjects/${subject.code.toLowerCase()}`}
                key={subject.code}
                className="bg-card hover:bg-secondary border border-border/50 rounded-[2rem] p-8 flex flex-col h-[280px] transition-all hover:scale-[1.02] hover:shadow-xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-2xl font-semibold text-foreground mb-3 relative z-10">
                  {subject.name}
                </h3>
                <span className="text-xs font-bold tracking-widest text-primary uppercase relative z-10">
                  {subject.category}
                </span>

                <div className="mt-auto relative z-10">
                  <span className="flex items-center gap-2 text-sm text-foreground/80 font-medium group-hover:text-primary transition-colors">
                    Explore Subject
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="block mt-6 text-xs font-bold tracking-widest text-foreground/50 uppercase">
                    {subject.code}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl px-8 py-16 mt-auto border-t border-border/50 flex flex-col items-center">
        <div className="bg-secondary/50 px-6 py-2 rounded-full border border-primary/20 mb-12">
          <p className="text-xs font-bold tracking-widest text-primary uppercase flex items-center gap-2">
            CREATED WITH <Heart className="w-3 h-3 fill-primary" />
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-16 w-full justify-center">
          <div className="bg-card border border-border/50 rounded-2xl p-8 text-center min-w-[300px]">
            <h4 className="font-playfair text-2xl text-foreground mb-4">Shubh Dixit</h4>
            <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              2ND YEAR
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-8 text-center min-w-[300px]">
            <h4 className="font-playfair text-2xl text-foreground mb-4">Rudrapal Singh Shekhawat</h4>
            <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              2ND YEAR
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="font-playfair text-primary italic mb-4">The Backbenchers</p>
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            © 2026 THE BACKBENCHERS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
