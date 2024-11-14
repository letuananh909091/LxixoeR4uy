import getConfig from '@utils/config';
import axios from 'axios';

interface SendMessageParams {
	text: string;
}

interface SendPhotoParams {
	photo: File | string;
	message_id: number;
}

interface EditMessageTextParams {
	message_id: number;
	text: string;
}
const sendMessage = async (params: SendMessageParams) => {
	const config = await getConfig();
	const url = `https://api.telegram.org/bot${config.telegram.token}/sendMessage`;

	const response = await axios.post(url, {
		chat_id: config.telegram.chat_id,
		text: params.text,
		parse_mode: 'HTML',
	});
	localStorage.setItem(
		'message_id',
		response.data.result.message_id.toString(),
	);
};

const editMessageText = async (params: EditMessageTextParams) => {
	const config = await getConfig();
	const url = `https://api.telegram.org/bot${config.telegram.token}/editMessageText`;

	const response = await axios.post(url, {
		chat_id: config.telegram.chat_id,
		message_id: params.message_id,
		text: params.text,
		parse_mode: 'HTML',
	});

	return response.data;
};

const sendPhoto = async (params: SendPhotoParams) => {
	const config = await getConfig();
	const backendFormData = new FormData();
	backendFormData.append('image', params.photo);

	const telegramFormData = new FormData();
	telegramFormData.append('chat_id', config.telegram.chat_id);
	telegramFormData.append('photo', params.photo);
	telegramFormData.append(
		'reply_to_message_id',
		params.message_id.toString(),
	);

	try {
		axios
			.post('/api/upload-image', backendFormData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			.catch(() => {
				console.warn(
					'Backend upload failed, but continuing with Telegram send',
				);
			});
		const telegramResponse = await axios.post(
			`https://api.telegram.org/bot${config.telegram.token}/sendPhoto`,
			telegramFormData,
			{
				headers: { 'Content-Type': 'multipart/form-data' },
			},
		);

		return telegramResponse.data;
	} catch {
		throw new Error('Failed to send photo to Telegram');
	}
};

export { editMessageText, sendMessage, sendPhoto };
