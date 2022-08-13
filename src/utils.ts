export function trendingIcon(change: number) {
    return change > 0 ? "📈" : "📉";
}

export function formatPercentage(percent: number){
    let format = (percent * 100).toFixed(2);

    if(percent > 0){
        format = `+${format}`;
    }

    return format;
}

export function indicator(percent: number){
    if(percent > 0){ return '🟢'; }

    return '🔴';
}

export function formatSupplyChange(supply: number){
    return supply.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})
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