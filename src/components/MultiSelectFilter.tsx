import { ReactElement, useState, useRef, useEffect } from "react";

interface MultiSelectFilterProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    enableSearch?: boolean;
}

export function MultiSelectFilter(props: MultiSelectFilterProps): ReactElement {
    const { label, options, selectedValues, onChange, enableSearch = true } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    // Focus search input when dropdown opens (only if search is enabled)
    useEffect(() => {
        if (isOpen && enableSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, enableSearch]);

    // Update indeterminate state whenever selectedValues changes
    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const isAllSelected = selectedValues.length === options.length && options.length > 0;
            const isNoneSelected = selectedValues.length === 0;
            const isIndeterminate = !isAllSelected && !isNoneSelected;

            selectAllCheckboxRef.current.indeterminate = isIndeterminate;

            // Toggle ag-indeterminate, ag-checked classes on the wrapper
            const wrapper = selectAllCheckboxRef.current.parentElement;
            if (wrapper && wrapper.classList.contains("ag-checkbox-input-wrapper")) {
                // Remove all state classes first
                wrapper.classList.remove("ag-indeterminate", "ag-checked");

                // Add appropriate state class
                if (isIndeterminate) {
                    wrapper.classList.add("ag-indeterminate");
                } else if (isAllSelected) {
                    wrapper.classList.add("ag-checked");
                }
            }
        }
    }, [selectedValues, options.length]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        setSearchText("");
    };

    const toggleValue = (value: string) => {
        const newSelection = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        onChange(newSelection);
    };

    const toggleSelectAll = () => {
        // If all selected, unselect all
        // If partial or none selected, select all
        if (selectedValues.length === options.length) {
            onChange([]);
        } else {
            onChange([...options]);
        }
    };

    const filteredOptions = enableSearch
        ? options.filter((option) => option.toLowerCase().includes(searchText.toLowerCase()))
        : options;

    // Display text logic
    const getDisplayText = () => {
        if (selectedValues.length === 0 || selectedValues.length === options.length) {
            return "All";
        }
        return selectedValues.join(", ");
    };

    // Select All checkbox state
    const isAllSelected = selectedValues.length === options.length && options.length > 0;

    return (
        <div className="multiselect-filter" ref={containerRef}>
            <button
                type="button"
                className="multiselect-trigger"
                onClick={toggleDropdown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={`${label} filter`}
            >
                <span className="multiselect-label">{label}:</span>
                <span className="multiselect-value">{getDisplayText()}</span>
                <svg
                    className={`multiselect-arrow ${isOpen ? "open" : ""}`}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M7 10l5 5 5-5z" />
                </svg>
            </button>

            {isOpen && (
                <div className="multiselect-dropdown" role="listbox">
                    {enableSearch && (
                        <div className="multiselect-search">
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="multiselect-search-input"
                                placeholder="Search..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                aria-label="Search options"
                            />
                        </div>
                    )}

                    <div className="multiselect-select-all">
                        <label className="multiselect-select-all-label">
                            <div className="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper">
                                <input
                                    ref={selectAllCheckboxRef}
                                    type="checkbox"
                                    className="ag-input-field-input ag-checkbox-input"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                    aria-label="Select all options"
                                />
                            </div>
                            <span className="multiselect-select-all-text">Select All</span>
                        </label>
                    </div>

                    <div className="multiselect-options">
                        {filteredOptions.length === 0 ? (
                            <div className="multiselect-no-results">No matches found</div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isChecked = selectedValues.includes(option);
                                return (
                                    <div
                                        key={option}
                                        className="multiselect-option"
                                        role="option"
                                        aria-selected={isChecked}
                                    >
                                        <label className="multiselect-option-label">
                                            <div
                                                className={`ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper ${
                                                    isChecked ? "ag-checked" : ""
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="ag-input-field-input ag-checkbox-input"
                                                    checked={isChecked}
                                                    onChange={() => toggleValue(option)}
                                                    aria-label={option}
                                                />
                                            </div>
                                            <span className="multiselect-option-text">
                                                {option}
                                            </span>
                                        </label>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
