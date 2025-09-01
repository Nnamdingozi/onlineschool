// import { NextLogo } from "./next-logo";
// import { SupabaseLogo } from "./supabase-logo";
// import CardSwap, { Card } from '@/components/reactbitstyles/cardSwap';
// import ShinyText from '@/components/reactbitstyles/textstyle'






// export function Hero() {
//   return (
//     <div className="flex  gap-16 items-center w-full border-2 border-green-400">
//       {/* <div className="flex gap-8 justify-center items-center">
//         <a
//           href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
//           target="_blank"
//           rel="noreferrer"
//         >
//           <SupabaseLogo />
//         </a>
//         <span className="border-l rotate-45 h-6" />
//         <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
//           <NextLogo />
//         </a>
//       </div>
//       <h1 className="sr-only">Supabase and Next.js Starter Template</h1>
//       <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
//         The fastest way to build apps with{" "}
//         <a
//           href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
//           target="_blank"
//           className="font-bold hover:underline"
//           rel="noreferrer"
//         >
//           Supabase
//         </a>{" "}
//         and{" "}
//         <a
//           href="https://nextjs.org/"
//           target="_blank"
//           className="font-bold hover:underline"
//           rel="noreferrer"
//         >
//           Next.js
//         </a>
//       </p>
//       // <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" /> */}
//       {/* <ShinyText text="Class Bridge Online academy" disabled={false} speed={3} className='custom-class text-5xl' />*/}


//       <div className="w-1/3 ">
//         {/* <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8 border-2 border-purple-400" /> */}
//         <ShinyText text="Class Bridge Online academy" disabled={false} speed={3} className='custom-class text-3xl' />


//         <h1 className=" text-2xl">Learn without boundaries</h1>
//         <p className="text-3xl lg:text-4xl !leading-tight mx-auto">Learn at your own pace from the comfort of your home </p>
//       </div>

     
//         <CardSwap
//           cardDistance={30}
//           verticalDistance={40}
//           delay={5000}
//           pauseOnHover={false}
//         >
//           <Card>
//             <h3>Card 1</h3>
//             <p className="text-center">Unlock your full potential. Learn from the best.</p>
//           </Card>
//           <Card>
//             <h3>Card 2</h3>
//             <p>Ace all subjects in your examinations</p>
//           </Card>
//           <Card>
//             <h3>Card 3</h3>
//             <p>study with our AI powered tools for the best learning experience ever</p>
//           </Card>
//         </CardSwap>
    




//     </div>
//   );
// }





// import ShinyText from '@/components/reactbitstyles/textstyle'






// export function Hero() {
//   return (
    
// <div className="flex flex-row items-start justify-between gap-10 px-4 border-2  max-h-screen  w-full  border-purple-500/30 rounded-xl bg-white dark:backdrop-blur-md dark:bg-white/10 shadow-xl mt-32 h-48 ">
//   {/* Left Side: Text Content */}
//   <div className="border-2 border-green-400 w-[65%] h-auto my-auto rounded-md shadow-2xl p-4">
//   <ShinyText text="Welcome to ClassBridge" disabled={false} speed={3} className='custom-class text-5xl' />
//     <p className="text-lg text-muted-foreground mt-7 text-black">
//       Choose your class and explore interactive lessons tailored for JS1 to SS3.
//     </p>
//   </div>

//   {/* Right Side: Card Swap or Cards Grid */}

    



// </div>
//   )
// }

// import ShinyText from '@/components/reactbitstyles/textstyle';

// export function Hero() {
//   return (
//     <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-10 px-4 border-2 max-h-screen w-full border-purple-500/30 rounded-xl bg-white dark:backdrop-blur-md dark:bg-white/10 shadow-xl mt-20 md:mt-32 p-4">
//       {/* Left Side: Text Content */}
//       <div className="border-2 border-green-400 w-full md:w-[65%] h-auto my-auto rounded-md shadow-2xl p-4">
//         <ShinyText
//           text="Welcome to ClassBridge"
//           disabled={false}
//           speed={3}
//           className="custom-class text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
//         />
//         <p className="text-sm sm:text-base  text-muted-foreground mt-5 text-black">
//           Choose your class and explore interactive lessons tailored for JS1 to SS3.
//         </p>
//       </div>

//       {/* Right Side: Placeholder for future Cards/Content */}
//       <div className="w-full md:w-[35%] border-2 border-dashed border-gray-300 h-32 md:h-auto rounded-md flex items-center justify-center text-gray-400">
//         {/* Example placeholder */}
//         <span className="text-xs sm:text-sm md:text-base">Card Section</span>
//       </div>
//     </div>
//   );
// }

import ShinyText from '@/components/reactbitstyles/textstyle';

export function Hero() {
  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-10 px-4 border-2 max-h-screen w-full border-purple-500/30 rounded-xl bg-white dark:backdrop-blur-md dark:bg-white/10 shadow-xl mt-20 md:mt-32 p-4">
      {/* Left Side: Text Content */}
      <div className="border-2 border-green-400 w-full md:w-[65%] lg:w-full h-auto my-auto rounded-md shadow-2xl p-4">
        <ShinyText
          text="Welcome to ClassBridge"
          disabled={false}
          speed={3}
          className="custom-class text-2xl sm:text-3xl sm:w-full md:text-4xl md:w-1/2 lg:text-5xl"
        />
        <p className="text-sm sm:text-base  text-muted-foreground text-black w-full md:w-1/2">
          Choose your class and explore interactive lessons tailored for JS1 to SS3.
        </p>
      </div>
      
    </div>
  );
}
