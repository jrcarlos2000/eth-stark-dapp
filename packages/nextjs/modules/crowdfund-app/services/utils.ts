export function truncateAddress(
  address: string,
  charsToShow: number = 6
): string {
  // Check if the input is a string
  if (typeof address !== "string") {
    throw new TypeError("Address must be a string.");
  }

  // Check if the address starts with '0x' and has a length of 42 characters
  if (!address.startsWith("0x")) {
    throw new Error("Invalid Ethereum address format.");
  }

  // Ensure charsToShow is a positive number and less than half the address length (excluding '0x')
  if (charsToShow <= 0 || charsToShow * 2 >= address.length - 2) {
    throw new Error(
      "charsToShow must be greater than 0 and less than half the address length minus the '0x' prefix."
    );
  }

  // Construct and return the truncated address
  return `${address.slice(0, charsToShow + 2)}...${address.slice(-charsToShow)}`;
}
