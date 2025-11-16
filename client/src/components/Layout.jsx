import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { motion } from "framer-motion";

export default function Layout({ children }) {
  return (
    <div className="w-screen h-screen flex bg-[#0d0f11] text-white overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative">

        {/* Header */}
        <Header />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 overflow-y-auto px-6 py-6"
        >
          {children}
        </motion.div>

      </div>
    </div>
  );
}
