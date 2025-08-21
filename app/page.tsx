
import { Hero } from "@/components/hero";
import Link from "next/link";
import CardSwap, { Card } from '@/components/reactbitstyles/cardSwap';
import ProfileCardWrapper from "@/components/reactbitstyles/profileCardWrapper";

export default function Home() {
  return (
    // <main className="min-h-screen flex flex-col items-center">
    <div className="flex-1 w-full flex flex-col gap-20 items-center min-h-screen ">

      <main className="flex-1 flex flex-col gap-6 px-4 w-full min-h-screen">
        <div className="flex-1 flex flex-col gap-20 w-full">

          <Hero />
          <p className="text-black dark:text-white">Already logged in? <Link href={'/protected/class'}>Back to Class</Link></p>

          <CardSwap
            cardDistance={30}
            verticalDistance={40}
            delay={8000}
            pauseOnHover={false}
          >    
         
          <Card className="bg-[url('/images/studentStudy.png')] bg-contain bg-center bg-no-repeat text-white flex flex-col items-center justify-center text-center p-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-md mt-36 w-full">
  <h3 className="text-xl font-semibold">Expert-Led Video Lessons</h3>
  <p className="text-sm">
    Learn directly from experienced teachers across all subjects and levels—from JSS to SS3.
  </p>
  
  </div>
</Card>



            <Card className="bg-green-400 text-white flex flex-col items-center justify-center text-center p-6">
              <h3 className="text-xl font-semibold">Smart Practice & Mock Exams</h3>
              <p className="text-center text-sm">
                Prepare with past questions, timed mock tests, and instant feedback to boost your exam confidence.
              </p>
            </Card>
            <Card className="bg-purple-400 text-white flex flex-col items-center justify-center text-center p-6">
              <h3 className="text-xl font-semibold">AI-Powered Study Assistant</h3>
              <p className="text-center text-sm">
                Get personalized help, summaries, and explanations using our AI tutor available 24/7.
              </p>
            </Card>
          </CardSwap>

          <div className="mt-32 border-2 border-gray-600 shadow-2xl">
            <h2 className="font-medium text-xl mb-4 text-left ml-5">Sign up, <Link href={'/protected'}><span className="text-green-600">select your class</span></Link> to get started</h2>
            {/* {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />} */}

            <div className="flex flex-wrap gap-4">

              <ProfileCardWrapper />

            </div>
          </div>

        </div>
      </main>


    </div>

  );
}
