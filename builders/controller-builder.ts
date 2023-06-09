import { type Request, type Response } from 'express';
import {
	type UsersQuery,
	type UsersMutation,
} from '../controllers/users-controllers';
import {
	type CardsMutation,
	type CardsQuery,
} from '../controllers/cards-controller';
import { Status, ErrorName, QueryKind, type MutationKind } from '../utils';

type AppQuery = UsersQuery | CardsQuery;

type AppMutation<IsCreateOrDelete extends boolean = false> =
	IsCreateOrDelete extends true
		? CardsMutation<true> | UsersMutation<true>
		: UsersMutation | CardsMutation;

interface AppRequest extends Request {
	params: {
		userId?: string;
		cardId?: string;
	};

	user: {
		_id: string;
	};
}

interface QueryArgs {
	query: (request?: AppRequest) => AppQuery;
	queryKind?: QueryKind;
}

interface MutationArgs {
	mutation: (request: AppRequest) => AppMutation<true | false>;
	mutationKind?: MutationKind;
}

const handleError = (error: Error, response: Response) => {
	const errorName = error.name;

	switch (errorName) {
		case ErrorName.validation: {
			response.status(Status.badRequest);
			break;
		}

		case ErrorName.notFound: {
			response.status(Status.notFound);
			break;
		}

		case ErrorName.cast: {
			response.status(Status.badRequest);
			break;
		}

		default: {
			response.status(Status.internalServerError);
			break;
		}
	}

	response.send({
		message: error.message ?? 'Unexpected error',
		error: error.name,
	});
};

const controllerBuilder = {
	query({ query, queryKind = QueryKind.filter }: QueryArgs) {
		return (request: Request, response: Response) => {
			let promiseChain = query(request as AppRequest);

			if (queryKind === QueryKind.filter) {
				promiseChain = promiseChain.orFail();
			}

			promiseChain
				.then((data) => {
					response.status(Status.ok).send({ data });
				})
				.catch((error) => {
					handleError(error, response);
				});
		};
	},
	mutation({ mutation }: MutationArgs) {
		return (request: Request, response: Response) => {
			mutation(request as AppRequest)
				.then((data) => {
					if (!data) {
						const error = new Error(
							`No document with id: '${
								request.params.cardId ?? request.params.userId
							}' was found in model`
						);
						error.name = ErrorName.notFound;

						throw error;
					}

					response.status(Status.ok);
					response.send({ data });
				})
				.catch((error) => {
					handleError(error, response);
				});
		};
	},
};

export default controllerBuilder;
export type { AppQuery, AppRequest };
