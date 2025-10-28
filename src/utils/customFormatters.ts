/**
 * Custom Formatter System
 * Allows users to define reusable formatters in widget configuration
 */

export interface CustomFormatterConfig {
    formatterName: string;
    formatterType: "javascript" | "microflow";
    formatterCode: string;
    formatterConfig?: string; // JSON string
}

export interface FormatterContext {
    value: any;
    item: any;
    column: any;
    config?: any; // Parsed JSON from formatterConfig
}

// Type for compiled formatter function
type FormatterFunction = (value: any, item: any, column: any) => string;

/**
 * Registry for custom formatters
 */
export class CustomFormatterRegistry {
    private formatters: Map<string, FormatterFunction> = new Map();

    /**
     * Register custom formatters from widget configuration
     */
    registerFormatters(formattersConfig: CustomFormatterConfig[]): void {
        console.log("[CustomFormatterRegistry] registerFormatters called with:", formattersConfig);
        
        if (!formattersConfig || !Array.isArray(formattersConfig)) {
            console.log("[CustomFormatterRegistry] Invalid config - not an array or null");
            return;
        }

        console.log(`[CustomFormatterRegistry] Processing ${formattersConfig.length} formatters`);

        formattersConfig.forEach((formatter) => {
            console.log(`[CustomFormatterRegistry] Registering formatter:`, {
                name: formatter.formatterName,
                type: formatter.formatterType,
                hasCode: !!formatter.formatterCode,
                hasConfig: !!formatter.formatterConfig
            });
            
            try {
                if (formatter.formatterType === "javascript") {
                    const compiledFunction = this.compileJavaScriptFormatter(
                        formatter.formatterCode,
                        formatter.formatterConfig
                    );
                    this.formatters.set(formatter.formatterName, compiledFunction);
                    console.log(`[CustomFormatterRegistry] ✓ Successfully registered: ${formatter.formatterName}`);
                }
                // Future: Add microflow support
            } catch (error) {
                console.error(
                    `[CustomFormatterRegistry] ✗ Failed to register custom formatter "${formatter.formatterName}":`,
                    error
                );
            }
        });
        
        console.log(`[CustomFormatterRegistry] Total registered formatters: ${this.formatters.size}`, this.getFormatterNames());
    }

    /**
     * Compile JavaScript formatter code into executable function
     */
    private compileJavaScriptFormatter(code: string, configJson?: string): FormatterFunction {
        console.log("[CustomFormatterRegistry] Compiling formatter with code:", code?.substring(0, 100) + "...");
        
        // Parse configuration if provided
        let config: any;
        if (configJson && configJson.trim()) {
            console.log("[CustomFormatterRegistry] Parsing config JSON:", configJson);
            try {
                config = JSON.parse(configJson);
                console.log("[CustomFormatterRegistry] Config parsed successfully:", config);
            } catch (e) {
                console.warn("[CustomFormatterRegistry] Invalid formatter config JSON:", e);
            }
        }

        // Create function from code string
        // Available variables: value, item, column, config
        try {
            // Wrap in function with controlled scope
            const functionBody = `
                "use strict";
                ${code}
            `;

            console.log("[CustomFormatterRegistry] Creating function with body:", functionBody.substring(0, 200) + "...");

            // Create function with parameter names
            // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
            const formatter = new Function("value", "item", "column", "config", functionBody);
            
            console.log("[CustomFormatterRegistry] Function compiled successfully");

            // Return wrapper that injects config
            return (value: any, item: any, column: any): string => {
                try {
                    const result = formatter(value, item, column, config);
                    return result !== null && result !== undefined ? String(result) : "";
                } catch (error) {
                    console.error("[CustomFormatterRegistry] Error executing custom formatter:", error);
                    return String(value || "");
                }
            };
        } catch (error) {
            console.error("[CustomFormatterRegistry] Error compiling formatter code:", error);
            console.error("[CustomFormatterRegistry] Code that failed:", code);
            throw error;
        }
    }

    /**
     * Execute a custom formatter by name
     */
    execute(formatterName: string, context: FormatterContext): string {
        const formatter = this.formatters.get(formatterName);

        if (!formatter) {
            console.warn(`Custom formatter "${formatterName}" not found`);
            return String(context.value || "");
        }

        try {
            const result = formatter(context.value, context.item, context.column);
            return result !== null && result !== undefined ? String(result) : "";
        } catch (error) {
            console.error(`Error executing formatter "${formatterName}":`, error);
            return String(context.value || "");
        }
    }

    /**
     * Check if formatter exists
     */
    has(formatterName: string): boolean {
        return this.formatters.has(formatterName);
    }

    /**
     * Get all registered formatter names
     */
    getFormatterNames(): string[] {
        return Array.from(this.formatters.keys());
    }

    /**
     * Clear all formatters
     */
    clear(): void {
        this.formatters.clear();
    }
}
