"use client";

import React, { createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/presentation/utils/cn";

interface FieldContextValue {
  invalid: boolean;
  disabled: boolean;
  success: boolean;
}

const FieldContext = createContext<FieldContextValue>({
  invalid: false,
  disabled: false,
  success: false,
});

export function useFieldContext() {
  return useContext(FieldContext);
}

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  invalid?: boolean;
  disabled?: boolean;
  success?: boolean;
  orientation?: "vertical" | "horizontal";
}

export function Field({
  children,
  className,
  invalid = false,
  disabled = false,
  success = false,
  orientation = "vertical",
  ...props
}: FieldProps) {
  return (
    <FieldContext.Provider value={{ invalid, disabled, success }}>
      <div
        className={cn(
          orientation === "horizontal"
            ? "flex flex-row items-center gap-2"
            : "flex flex-col gap-1.5",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  );
}

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FieldLabel({
  className,
  required,
  children,
  ...props
}: FieldLabelProps) {
  const { disabled } = useFieldContext();

  return (
    <label
      className={cn(
        "font-bold text-sm text-foreground",
        disabled && "text-[#b0babf]",
        className
      )}
      {...props}
    >
      {children}
      {required ? <span className="ms-0.5 font-normal text-destructive">*</span> : null}
    </label>
  );
}

interface FieldDescriptionProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "error" | "success";
}

export function FieldDescription({
  children,
  className,
  variant = "default",
}: FieldDescriptionProps) {
  const { invalid } = useFieldContext();

  const effectiveVariant = invalid ? "error" : variant;

  return (
    <motion.p
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "text-sm overflow-hidden",
        effectiveVariant === "error" && "text-destructive",
        effectiveVariant === "success" && "text-[#22c55e]",
        effectiveVariant === "default" && "text-muted-foreground",
        className
      )}
    >
      {children}
    </motion.p>
  );
}

interface FieldErrorProps {
  message?: string;
  className?: string;
}

export function FieldError({ message, className }: FieldErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          key="error"
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn("text-sm text-destructive overflow-hidden", className)}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function FieldGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-4", className)} {...props} />;
}
