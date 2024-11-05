import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// Layout Component that wraps around all routes inside route group 'root'
// it ensures a consistent layout for all routes within the route group 'root'
// this Layout component will be given to the Root Layout component as a child
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />

      {/* min-height will be: 100vh - NavBar height - Footer height - 1px */}
      <main className="grainy-light flex min-h-[calc(100vh-3.5rem-5rem-1px)] flex-col">
        <div className="flex h-full flex-1 flex-col">{children}</div>
      </main>

      <Footer />
    </>
  );
};

export default Layout;
