function checkEntryPlural(amount, string) {
	if (amount == 1) return `${string}y`;

	return `${string}ies`;
}

module.exports = { checkEntryPlural };
