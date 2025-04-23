"use client";

import { motion } from "framer-motion";

interface BilingualDataItemProps {
  label: string;
  value: any;
  index: number;
}

export function BilingualDataItem({ label, value, index }: BilingualDataItemProps) {
  return (
    <motion.div
      className="flex flex-col border rounded-md overflow-hidden bg-white dark:bg-gray-800"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="bg-gray-50 dark:bg-gray-700 px-3 py-1 border-b">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
      </div>
      <div className="p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <span className="font-medium">{value.english}</span>
        <span className="font-medium text-right font-noto-sans-arabic" dir="rtl">
          {value.arabic}
        </span>
      </div>
    </motion.div>
  );
}