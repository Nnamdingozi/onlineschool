
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  
  return (
    <main className="min-h-screen flex flex-col items-center h-auto">
 
      <div className="flex-1 w-full flex flex-col gap-20 items-center bg-[url('/images/microscope.png')] bg-cover bg-center h-full">
  
        <div className="flex-1 flex flex-col gap-20 max-w-7xl p-5 h-auto w-full">
          {children}
        </div>
      </div>
    </main>
  );
}
