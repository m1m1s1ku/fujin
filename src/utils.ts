/**
 * Helps TypeScript to understand that the value is defined in special cases.
 * 
 * @param val 
 * 
 * @returns type-safe value
 */
export function unwrap<T = unknown>(val: unknown): T {
    return val as T;
}

export function trendingIcon(change: number) {
    return change > 0 ? "📈" : "📉";
}

export function formatPercentage(percent: number){
    let format = (percent).toFixed(2);

    if(percent > 0){
        format = `+${format}`;
    }

    return format;
}

export function indicator(percent: number){
    if(percent > 0){ return '🟢'; }

    return '🔴';
}

export function localizeNumber(number: number){
    return number.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})
}

export function bigIntToString(mc: number) {
    let suffix = "";
    let integerString = mc;
  
    if (integerString > 1_000_000_000) {
        integerString /= (10 ** 9);
        suffix = "B"
    } else if (integerString > 1_000_000) {
        integerString /= (10 ** 6);
        suffix = "M"
    }
  
    return `${integerString.toFixed(2)}${suffix}`;
}