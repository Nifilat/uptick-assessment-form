import React from "react";
import { Raleway } from "next/font/google";
import AssessmentForm from "@/components/assessment/AssessmentForm";
import Box from "@/components/ui/box";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-raleway",
});

const Entry: React.FC = () => {
  return (
    <main
      className={`${raleway.variable} font-sans min-h-screen flex items-center justify-center bg-[#F4F7FF] dark:bg-[#071028] text-foreground py-12 px-4`}
    >
      <Box className="w-full max-w-3xl bg-transparent">
        <AssessmentForm assessmentId="3c30d406-27f4-4038-9cd5-1c4f3385ffd4" />
      </Box>
    </main>
  );
};

export default Entry;
