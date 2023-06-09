const enum Status {
	ok = 200,
	badRequest = 400,
	notFound = 404,
	internalServerError = 500,
}

const enum ErrorName {
	validation = 'ValidationError',
	notFound = 'DocumentNotFoundError',
	cast = 'CastError',
}

const enum QueryKind {
	all,
	filter,
}

const enum MutationKind {
	create,
	delete,
	update,
}

// Const enum Resource {
// 	user = 'user',
// 	users = 'users',
// 	cards = 'cards',
// }

const linkValidationRegex =
	/^http(s)?:\/\/(www.)?[\w.~:/?%#\]@!$&'()*+,;=]{1,256}$/i;

const mongooseLinkValidator = (link: string) => linkValidationRegex.test(link);

export {
	Status,
	ErrorName,
	QueryKind,
	MutationKind,
	linkValidationRegex,
	mongooseLinkValidator,
};
