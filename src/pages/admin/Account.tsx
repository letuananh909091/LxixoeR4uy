import Toast from '@components/Toast';
import {
	faCheck,
	faEye,
	faEyeSlash,
	faTimes,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useState } from 'react';

const Account = () => {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		username: '',
		password: '',
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');

		try {
			if (formData.username === 'admin') {
				setToastMessage('Không thể đổi mật khẩu của admin');
				setLoading(false);
				return;
			}

			const token = localStorage.getItem('token');
			await axios.post('/api/admin/change-password', formData, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setMessage('Thông tin tài khoản đã được cập nhật');
		} catch (error) {
			console.error('Failed to update account:', error);
			setToastMessage('Không thể cập nhật thông tin tài khoản');
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
										icon={faUser}
										className='text-2xl text-white'
									/>
								</div>
								<h1 className='text-center text-2xl font-bold text-purple-900 sm:text-left'>
									Thông Tin Tài Khoản
								</h1>
							</div>

							<form onSubmit={handleSubmit} className='space-y-4'>
								<div>
									<label
										htmlFor='username'
										className='block text-sm font-medium text-purple-700'
									>
										Tên Đăng Nhập
									</label>
									<input
										type='text'
										id='username'
										name='username'
										value={formData.username}
										onChange={handleChange}
										className='mt-1 block w-full rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 placeholder-purple-400 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
										placeholder='Nhập tên đăng nhập'
										autoFocus
									/>
								</div>

								<div>
									<label
										htmlFor='password'
										className='block text-sm font-medium text-purple-700'
									>
										Mật Khẩu
									</label>
									<div className='relative mt-1'>
										<input
											type={
												showPassword
													? 'text'
													: 'password'
											}
											id='password'
											name='password'
											value={formData.password}
											onChange={handleChange}
											className='block w-full rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 placeholder-purple-400 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
											placeholder='Nhập mật khẩu'
										/>
										<button
											type='button'
											onClick={() =>
												setShowPassword(!showPassword)
											}
											className='absolute right-3 top-1/2 -translate-y-1/2 transform text-purple-400 hover:text-purple-600'
										>
											<FontAwesomeIcon
												icon={
													showPassword
														? faEyeSlash
														: faEye
												}
											/>
										</button>
									</div>
								</div>

								<button
									type='submit'
									disabled={loading}
									className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50'
								>
									{loading
										? 'Đang cập nhật...'
										: 'Lưu Thay Đổi'}
								</button>
							</form>

							{message && (
								<div
									className={`animate-fade-in rounded-xl p-4 backdrop-blur-sm ${
										message.includes('Không thể')
											? 'border border-purple-200/50 bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-rose-50/80 text-purple-700'
											: 'border border-purple-200/50 bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-emerald-50/80 text-purple-700'
									}`}
								>
									<div className='flex items-center gap-2'>
										<FontAwesomeIcon
											icon={
												message.includes('Không thể')
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

export default Account;
