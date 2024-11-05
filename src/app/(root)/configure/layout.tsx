import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Steps from "@/components/Steps";

// Layout Component that wraps around all routes inside folder 'configure'
// it ensures a consistent layout for all routes within the folder 'configure'
// this Layout component will be given to the Root Layout component as a child
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MaxWidthWrapper className="flex flex-1 flex-col">
      {/* display the steps of getting a custom phone case */}
      <Steps />

      {children}
    </MaxWidthWrapper>
  );
};

export default Layout;
