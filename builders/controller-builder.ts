import { type Request, type Response } from 'express';
import { type UserData } from '../models/user-model';
import { type CardData } from '../models/card-model';
import {
	type UsersQuery,
	type UsersMutation,
} from '../controllers/users-controllers';
import {
	type CardsMutation,
	type CardsQuery,
} from '../controllers/cards-controller';
import { Status, ErrorName } from '../utils';

type AppData = CardData | UserData;

type AppQuery = UsersQuery | CardsQuery;

type AppMutation = UsersMutation | CardsMutation;

interface AppRequest extends Request {
	params: {
		id: string;
	};

	user: {
		_id: string;
	};
}

interface AppResponse extends Response {
	body: Partial<AppData>;
}

interface QueryArgs {
	query: (request?: AppRequest) => AppQuery;
}

interface MutationArgs {
	mutation: (request: AppRequest) => AppMutation;
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

		default: {
			response.status(Status.internalServerError);
			break;
		}
	}

	response.send({
		name: errorName,
		message: error.message ?? 'Error',
		error,
	});
};

const controllerBuilder = {
	query({ query }: QueryArgs) {
		return (request: Request, response: Response) => {
			query(request as AppRequest)
				.orFail()
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
					response.send({ data });
				})
				.catch((error) => {
					handleError(error, response);
				});
		};
	},
};

export default controllerBuilder;
export type { AppQuery, AppRequest, AppResponse };
