"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import EmailForm from "./components/EmailForm";
import EmailResult from "./components/EmailResult";
import SequenceResult from "./components/SequenceResult";

export default function EmailGeneratorPage() {
  const [result, setResult] = useState(null);
  const [sequence, setSequence] = useState(null);

  const handleResult = (data: any) => {
    setSequence(null);
    setResult(data);
  };

  const handleSequence = (data: any[]) => {
    setResult(null);
    setSequence(data);
  };

  return (
    <div className="min-h-screen w-full py-10 px-4 flex flex-col items-center text-white">
      <motion.h1
        className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        ✨ Générateur d’emails IA
      </motion.h1>

      {/* FORMULAIRE */}
      <EmailForm onEmail={handleResult} onSequence={handleSequence} />

      {/* RÉSULTAT EMAIL UNIQUE */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="mt-10 w-full max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EmailResult data={result} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* RÉSULTAT SÉQUENCE */}
      <AnimatePresence>
        {sequence && (
          <motion.div
            className="mt-10 w-full max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SequenceResult items={sequence} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
