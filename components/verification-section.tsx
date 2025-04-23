"use client";

import { UICardContainer } from "./ui-card-container";
import { Badge } from "./ui/badge";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";

interface VerificationSectionProps {
  verification: any;
}

export function VerificationSection({ verification }: VerificationSectionProps) {
  const getConfidenceBadge = () => {
    switch (verification.confidenceLevel) {
      case "High":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            High Confidence
          </Badge>
        );
      case "Medium":
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            Medium Confidence
          </Badge>
        );
      case "Low":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Low Confidence
          </Badge>
        );
      default:
        return (
          <Badge>
            <Info className="w-4 h-4 mr-1" />
            Unknown Confidence
          </Badge>
        );
    }
  };

  return (
    <UICardContainer title="Document Verification">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-lg">Authentication Status:</h3>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {verification.isAuthentic ? (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Authentic
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Non-Authentic
                </Badge>
              )}
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {getConfidenceBadge()}
          </motion.div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Verification Reasoning:</h3>
          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            {verification.reasoning}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Identified Elements:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {verification.identifiedElements.map((element:any, index:any) => (
              <motion.li
                key={index}
                className="flex items-center text-gray-700 dark:text-gray-300"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                {element}
              </motion.li>
            ))}
          </ul>
        </div>

        {verification.concerns.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Concerns:</h3>
            <ul className="space-y-1">
              {verification.concerns.map((concern:any, index:any) => (
                <li key={index} className="flex items-center text-amber-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </UICardContainer>
  );
}