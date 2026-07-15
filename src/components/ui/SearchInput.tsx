import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { InputHTMLAttributes } from "react";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helper?: string;
  error?: string;
};

export function SearchInput(props: SearchInputProps) {
  return <Input type="search" rightIcon={Search} {...props} />;
}