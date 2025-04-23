import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface UICardContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function UICardContainer({ title, children, className = "" }: UICardContainerProps) {
  return (
    <Card className={`shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}