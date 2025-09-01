
import { Hero } from "@/components/hero";
import Link from "next/link";
import CardSwap, { Card } from "@/components/reactbitstyles/cardSwap";
import ProfileCardWrapper from "@/components/reactbitstyles/profileCardWrapper";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col gap-10 sm:gap-20 w-full min-h-screen relative">
      <main className="flex-1 flex flex-col gap-6 px-4 w-full min-h-screen">
        <div className="flex-1 flex flex-col gap-20 w-full  min-h-screen h-screen">
          {/* Hero Section */}
          <Hero />

          {/* Already logged in message */}
          <p className="text-black dark:text-white mt-1 text-left w-full border-2 text-sm md:text-base" >
            Already logged in?{" "}
            <Link href={"/protected/class"}><span className="text-green-400">Back to Class</span></Link>
          </p>

          {/* Card Swap Section */}
          <CardSwap
            // cardDistance={30}
            // verticalDistance={30}
            // delay={8000}
            // pauseOnHover={false}
            // // width="10%"
            // // height="20%"
          
          >
            <Card className="bg-[url('/images/studentStudy.png')] bg-contain bg-center bg-no-repeat text-white 
flex flex-col items-center justify-center text-center p-6 
w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px] 
h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">

              <div className="bg-white/10 backdrop-blur-sm rounded-md mt-36 w-full">
                <h3 className="text-xl font-semibold">
                  Expert-Led Video Lessons
                </h3>
                <p className="text-sm">
                  Learn directly from experienced teachers across all subjects
                  and levels—from JSS to SS3.
                </p>
              </div>
            </Card>

            <Card className="bg-[url('/images/studentStudy.png')] bg-contain bg-center bg-no-repeat text-white 
flex flex-col items-center justify-center text-center p-6 
w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px] 
h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">

              <h3 className="text-xl font-semibold">
                Smart Practice & Mock Exams
              </h3>
              <p className="text-center text-sm">
                Prepare with past questions, timed mock tests, and instant
                feedback to boost your exam confidence.
              </p>
            </Card>

            <Card className="bg-[url('/images/studentStudy.png')] bg-contain bg-center bg-no-repeat text-white 
flex flex-col items-center justify-center text-center p-6 
w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px] 
h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px]">

              <h3 className="text-xl font-semibold">
                AI-Powered Study Assistant
              </h3>
              <p className="text-center text-sm">
                Get personalized help, summaries, and explanations using our AI
                tutor available 24/7.
              </p>
            </Card>
          </CardSwap>

          {/* Sign up Section */}
          <div className="mt-32 border-2 border-gray-600 shadow-2xl">
            <h2 className="font-medium text-xl mb-4 text-left ml-5">
              Sign up,{" "}
              <Link href={"/protected"}>
                <span className="text-green-600">select your class</span>
              </Link>{" "}
              to get started
            </h2>

            <div className="flex flex-wrap gap-4 mt-12">
              <ProfileCardWrapper />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


// import { Hero } from "@/components/hero";
// import Link from "next/link";
// import CardSwap, { Card } from '@/components/reactbitstyles/cardSwap';
// import ProfileCardWrapper from "@/components/reactbitstyles/profileCardWrapper";

// export default function Home() {
//   return (
//     <div className="flex-1 w-full flex flex-col items-center min-h-screen">
//       <main className="flex-1 flex flex-col gap-10 px-4 sm:px-6 md:px-12 w-full max-w-6xl min-h-screen">
//         <div className="flex-1 flex flex-col gap-16 w-full">
          
//           {/* Hero Section */}
//           <Hero />

//           {/* Back to Class Link */}
//           <p className="text-left text-black dark:text-white text-sm sm:text-base">
//             Already logged in?{" "}
//             <Link href={'/protected/class'} className="text-green-600 hover:underline">
//               Back to Class
//             </Link>
//           </p>

//           {/* Card Swap Section */}
//           <CardSwap
//             cardDistance={20}
//             verticalDistance={30}
//             delay={8000}
//             pauseOnHover={false}
//           >
//             <Card className="bg-[url('/images/studentStudy.png')] bg-cover sm:bg-contain bg-center bg-no-repeat text-white flex flex-col items-center justify-center text-center p-4 sm:p-6">
//               <div className="bg-white/10 backdrop-blur-sm rounded-md mt-24 sm:mt-36 w-full p-3 sm:p-4">
//                 <h3 className="text-lg sm:text-xl font-semibold">Expert-Led Video Lessons</h3>
//                 <p className="text-xs sm:text-sm">
//                   Learn directly from experienced teachers across all subjects and levels—from JSS to SS3.
//                 </p>
//               </div>
//             </Card>

//             <Card className="bg-green-400 text-white flex flex-col items-center justify-center text-center p-4 sm:p-6">
//               <h3 className="text-lg sm:text-xl font-semibold">Smart Practice & Mock Exams</h3>
//               <p className="text-xs sm:text-sm">
//                 Prepare with past questions, timed mock tests, and instant feedback to boost your exam confidence.
//               </p>
//             </Card>

//             <Card className="bg-purple-400 text-white flex flex-col items-center justify-center text-center p-4 sm:p-6">
//               <h3 className="text-lg sm:text-xl font-semibold">AI-Powered Study Assistant</h3>
//               <p className="text-xs sm:text-sm">
//                 Get personalized help, summaries, and explanations using our AI tutor available 24/7.
//               </p>
//             </Card>
//           </CardSwap>

//           {/* CTA Section */}
//           <div className="mt-20 sm:mt-32 border border-gray-300 dark:border-gray-600 shadow-2xl rounded-lg p-4 sm:p-6">
//             <h2 className="font-medium text-lg sm:text-xl mb-4 text-center sm:text-left">
//               Sign up,{" "}
//               <Link href={'/protected'}>
//                 <span className="text-green-600 hover:underline">select your class</span>
//               </Link>{" "}
//               to get started
//             </h2>

//             <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
//               <ProfileCardWrapper />
//             </div>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// }

