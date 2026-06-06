import { useEffect, useId, useRef, useState } from "react";
import {
  formatPhotonAddress,
  formatPhotonSuggestion,
  searchPhotonAddresses,
  type PhotonFeature,
} from "@/lib/photon";
import { cn } from "@/lib/utils";

type AddressAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onVerifiedChange?: (verified: boolean) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  verified?: boolean;
};

const AddressAutocomplete = ({
  value,
  onChange,
  onVerifiedChange,
  placeholder = "Start typing an address",
  className,
  disabled = false,
  error,
  verified = false,
}: AddressAutocompleteProps) => {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setSearchError(null);

      try {
        const results = await searchPhotonAddresses(value);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
        setSearchError("Address search is unavailable right now.");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (nextValue: string) => {
    onChange(nextValue);
    onVerifiedChange?.(false);
    setSearchError(null);
  };

  const handleSelect = (feature: PhotonFeature) => {
    const formatted = formatPhotonAddress(feature.properties);
    onChange(formatted);
    onVerifiedChange?.(true);
    setSuggestions([]);
    setOpen(false);
    setSearchError(null);
  };

  const showHint =
    value.trim().length >= 3 && !loading && suggestions.length === 0 && !open;

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={!!error}
        className={cn(className, error && "border-red-500")}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
      />

      {loading ? (
        <p className="mt-1 text-xs text-black/50">Searching addresses...</p>
      ) : null}

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-black/10 bg-white py-1 shadow-lg"
        >
          {suggestions.map((feature, index) => {
            const label = formatPhotonSuggestion(feature.properties);
            return (
              <li key={`${label}-${index}`} role="option">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-black hover:bg-black/5"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(feature)}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {showHint ? (
        <p className="mt-1 text-xs text-amber-700">
          No matches found. Try a different spelling or pick from the list.
        </p>
      ) : null}

      {searchError ? (
        <p className="mt-1 text-xs text-red-500">{searchError}</p>
      ) : null}

      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}

      {!error && !verified && value.trim().length >= 3 ? (
        <p className="mt-1 text-xs text-black/50">
          Pick an address from the suggestions so we know it is real.
        </p>
      ) : null}
    </div>
  );
};

export default AddressAutocomplete;
