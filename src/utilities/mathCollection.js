function makeFixedNum(number, precision) {
  // Handle the case where precision is not provided
  if (precision === undefined) {
    precision = 0;
  }

  // Round the number to the specified precision
  const multiplier = Math.pow(10, precision);
  const roundedNumber = Math.round(number * multiplier) / multiplier;

  // Convert the rounded number to a string
  let result = roundedNumber.toString();

  // Split the number into integer and fractional parts
  const parts = result.split('.');

  // If there is no fractional part, add one with the specified precision
  if (parts.length === 1) {
    if (precision > 0) {
      result += '.' + '0'.repeat(precision);
    }
    return result;
  }

  // Ensure the fractional part has the correct number of digits
  const fractionalPart = parts[1];
  if (fractionalPart.length < precision) {
    result += '0'.repeat(precision - fractionalPart.length);
  } else if (fractionalPart.length > precision) {
    // This should not happen due to rounding, but just in case
    result = parts[0] + '.' + fractionalPart.substring(0, precision);
  }

  return result;
}

export {
  makeFixedNum
}

// // Example usage:
// console.log(customToFixed(5.6789, 2)); // Output: "5.68"
// console.log(customToFixed(123.456, 0)); // Output: "123"
// console.log(customToFixed(7.8, 3)); // Output: "7.800"

