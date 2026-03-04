import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  categoryExistsInList,
  filterCategorySuggestions,
  normalizeCategoryDisplay,
  parseCommaSeparatedCategories,
} from "../../utils/categoryText";

interface VendorCategoryInputProps {
  label?: string;
  placeholder?: string;
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
  suggestions?: string[];
  disabled?: boolean;
}

export default function VendorCategoryInput({
  label = "Categories",
  placeholder = "Add a category (e.g., Electronics, Fashion)",
  categories,
  onCategoriesChange,
  suggestions = [],
  disabled = false,
}: VendorCategoryInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = filterCategorySuggestions(
    suggestions.filter((s) => !categoryExistsInList(s, categories)),
    inputValue,
    8,
  );

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Reset selected index when filtered suggestions change
  useEffect(() => {
    if (selectedSuggestionIndex >= filteredSuggestions.length) {
      setSelectedSuggestionIndex(
        filteredSuggestions.length > 0 ? filteredSuggestions.length - 1 : -1,
      );
    }
  }, [filteredSuggestions.length, selectedSuggestionIndex]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCategories = (categoriesToAdd: string[]) => {
    const newCategories = [...categories];
    let addedCount = 0;
    let duplicateFound = false;

    for (const cat of categoriesToAdd) {
      const normalized = normalizeCategoryDisplay(cat);

      if (!normalized) {
        setError("Cannot add empty category");
        continue;
      }

      if (categoryExistsInList(normalized, newCategories)) {
        duplicateFound = true;
        continue;
      }

      newCategories.push(normalized);
      addedCount++;
    }

    if (duplicateFound && addedCount === 0) {
      setError("Category already exists");
    } else if (addedCount > 0) {
      onCategoriesChange(newCategories);
      setInputValue("");
      setError(null);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleAddClick = () => {
    const parsed = parseCommaSeparatedCategories(inputValue);
    if (parsed.length === 0) {
      setError("Please enter a category");
      return;
    }
    addCategories(parsed);
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    onCategoriesChange(categories.filter((cat) => cat !== categoryToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // If a suggestion is selected, add it
      if (
        selectedSuggestionIndex >= 0 &&
        filteredSuggestions[selectedSuggestionIndex]
      ) {
        addCategories([filteredSuggestions[selectedSuggestionIndex]]);
        return;
      }

      // Otherwise, parse and add from input
      const parsed = parseCommaSeparatedCategories(inputValue);
      if (parsed.length > 0) {
        addCategories(parsed);
      } else {
        setError("Please enter a category");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      // Open suggestions if closed
      if (!showSuggestions && filteredSuggestions.length > 0) {
        setShowSuggestions(true);
      }
      // Navigate down
      if (filteredSuggestions.length > 0) {
        setSelectedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      // Open suggestions if closed
      if (!showSuggestions && filteredSuggestions.length > 0) {
        setShowSuggestions(true);
      }
      // Navigate up
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addCategories([suggestion]);
  };

  const handleFocus = () => {
    // Show suggestions on focus even if input is empty
    setShowSuggestions(true);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <div className="relative">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            disabled={disabled}
            className={error ? "border-destructive" : ""}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddClick}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Suggestions dropdown - now shows on focus even with empty input */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                  index === selectedSuggestionIndex ? "bg-accent" : ""
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Tip: You can add multiple categories at once by separating them with
        commas
      </p>

      {/* Selected categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((category) => (
            <Badge key={category} variant="secondary" className="gap-1">
              {category}
              <button
                type="button"
                onClick={() => handleRemoveCategory(category)}
                className="ml-1 hover:text-destructive"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
