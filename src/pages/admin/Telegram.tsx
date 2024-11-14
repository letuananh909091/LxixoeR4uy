import Toast from '@components/Toast';
import {
	faCheck,
	faCircleInfo,
	faPaperPlane,
	faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { useEffect, useState } from 'react';

interface ChatInfo {
	id: number;
	type: 'private' | 'group' | 'supergroup' | 'channel';
	title?: string;
	username?: string;
	first_name?: string;
	last_name?: string;
}

const Telegram = () => {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		chat_id: '',
		token: '',
	});

	const fetchConfig = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get('/api/admin/config', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const [chat_id, token_value] = response.data;

			const configData = {
				chat_id: chat_id || '',
				token: token_value || '',
			};

			setFormData({
				chat_id: configData.chat_id,
				token: configData.token,
			});
		} catch {
			setMessage('Không tìm thấy cấu hình');
		}
	};

	useEffect(() => {
		fetchConfig();
	}, []);

	const validateTelegramConfig = async (token: string, chatId: string) => {
		if (!token || !chatId) return;

		try {
			const response = await axios.get(
				`https://api.telegram.org/bot${token}/getChat`,
				{ params: { chat_id: chatId } },
			);

			if (response.data.ok) {
				setChatInfo(response.data.result);
				setMessage('Thông tin Telegram hợp lệ');
			}
		} catch {
			setChatInfo(null);
			setMessage('Thông tin Telegram không hợp lệ');
		}
	};

	const debouncedValidate = debounce(validateTelegramConfig, 500);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		if (name === 'token' || name === 'chat_id') {
			debouncedValidate(
				name === 'token' ? value : formData.token,
				name === 'chat_id' ? value : formData.chat_id,
			);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!chatInfo) {
			setMessage('Vui lòng kiểm tra thông tin Telegram');
			return;
		}

		setLoading(true);
		setMessage('');

		try {
			const token = localStorage.getItem('token');
			await axios.post('/api/admin/telegram', formData, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setMessage('Cấu hình Telegram đã được cập nhật');
			fetchConfig();
		} catch {
			setMessage('Không thể cập nhật cấu hình Telegram');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='relative'>
			<div className='absolute -left-10 -top-10 z-0 h-40 w-40 animate-float rounded-full bg-purple-100/10' />
			<div className='absolute right-20 top-40 z-0 h-24 w-24 animate-float-delayed rounded-full bg-pink-100/10' />
			<div className='absolute bottom-20 left-1/3 z-0 h-32 w-32 animate-float rounded-full bg-purple-100/10' />

			{toastMessage && (
				<Toast
					message={toastMessage}
					onClose={() => setToastMessage(null)}
				/>
			)}

			<div className='relative mx-auto max-w-2xl animate-fade-in'>
				<div className='overflow-hidden rounded-3xl bg-white/10 p-1 backdrop-blur-lg'>
					<div className='relative rounded-2xl bg-white p-4 shadow-2xl sm:p-8'>
						<div className='absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 opacity-20 blur-lg' />
						<div className='absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-500 opacity-20 blur-lg' />

						<div className='relative space-y-6'>
							<div className='flex flex-col items-center gap-3 sm:flex-row'>
								<div className='rounded-full bg-gradient-to-r from-purple-600 to-pink-500 p-2'>
									<FontAwesomeIcon
										icon={faPaperPlane}
										className='text-2xl text-white'
									/>
								</div>
								<h1 className='text-center text-2xl font-bold text-purple-900 sm:text-left'>
									Cấu Hình Telegram
								</h1>
							</div>

							<form onSubmit={handleSubmit} className='space-y-6'>
								<div className='space-y-4'>
									<div>
										<label
											htmlFor='chat_id'
											className='block text-sm font-medium text-purple-700'
										>
											Chat ID
										</label>
										<input
											type='text'
											id='chat_id'
											name='chat_id'
											value={formData.chat_id}
											onChange={handleChange}
											className='mt-1 block w-full rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 placeholder-purple-400 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
											placeholder='Nhập Chat ID Telegram'
											autoFocus
										/>
									</div>

									<div>
										<label
											htmlFor='token'
											className='block text-sm font-medium text-purple-700'
										>
											Token Bot
										</label>
										<input
											type='text'
											id='token'
											name='token'
											value={formData.token}
											onChange={handleChange}
											className='mt-1 block w-full rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 placeholder-purple-400 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
											placeholder='Nhập Token Bot Telegram'
										/>
									</div>
								</div>

								{chatInfo && (
									<div className='animate-fade-in rounded-xl border border-purple-100 bg-purple-50/50 p-4'>
										<div className='flex items-center gap-2 text-purple-700'>
											<FontAwesomeIcon
												icon={faCircleInfo}
												className='text-purple-500'
											/>
											<span className='font-medium'>
												Thông tin chat:
											</span>
										</div>
										<div className='mt-2 space-y-1 text-sm text-purple-600'>
											<p>ID: {chatInfo.id}</p>
											<p>Loại: {chatInfo.type}</p>
											{chatInfo.title && (
												<p>Tên: {chatInfo.title}</p>
											)}
											{chatInfo.username && (
												<p>
													Username:{' '}
													<a
														href={`https://t.me/${chatInfo.username}`}
														target='_blank'
														className='text-purple-600 hover:text-purple-700 hover:underline'
													>
														@{chatInfo.username}
													</a>
												</p>
											)}
											{chatInfo.first_name && (
												<p>
													Tên người dùng:{' '}
													{chatInfo.first_name}{' '}
													{chatInfo.last_name}
												</p>
											)}
										</div>
									</div>
								)}

								<button
									type='submit'
									disabled={loading || !chatInfo}
									className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:shadow-none'
								>
									{loading
										? 'Đang cập nhật...'
										: 'Lưu Cấu Hình'}
								</button>
							</form>

							{message && (
								<div
									className={`animate-fade-in rounded-xl p-4 backdrop-blur-sm ${
										message.includes('không hợp lệ') ||
										message.includes('Failed')
											? 'border border-purple-200/50 bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-rose-50/80'
											: 'border border-purple-200/50 bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-emerald-50/80'
									} text-purple-700`}
								>
									<div className='flex items-center gap-2'>
										<FontAwesomeIcon
											icon={
												message.includes(
													'không hợp lệ',
												) || message.includes('Failed')
													? faTimes
													: faCheck
											}
											className='text-purple-500'
										/>
										<span className='font-medium'>
											{message}
										</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Telegram;
