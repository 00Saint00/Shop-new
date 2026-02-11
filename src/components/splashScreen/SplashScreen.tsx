import { useState, useEffect } from "react";
import Splash from "../../assets/logo/SHOP.CO.svg";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState("logo");

  useEffect(() => {
    // Finish splash after 3s
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3000);

    return () => {
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    // <div className="flex items-center justify-center h-screen">
    //   {/* <img src={Splash} alt="Splash" className="mx-auto mt-10 w-1/2" /> */}

    //   <motion.img
    //     src={Splash}
    //     alt="Splash"
    //     className="w-40"
    //     initial={{ opacity: 0, scale: 0.9 }}
    //     exit={{ opacity: 0, scale: 0.8 }}
    //     animate={{ opacity: 1, scale: 1 }}
    //     transition={{ duration: 0.8 }}
    //   />
    // </div>
    <div className="flex items-center justify-center h-screen bg-white">
      {step === "text" && (
        <Typewriter
          words={['SHOP.CO ']}
          loop={1}
          typeSpeed={70}
          deleteSpeed={50}
          onLoopDone={() => setStep("logo")}
        />
      )}
      

      {step === "logo" && (
        <motion.img
          src={Splash}
          alt="Splash"
          className="w-40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8 }}
        />
      )}
    </div>
  );
};

export default SplashScreen;
