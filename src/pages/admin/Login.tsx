import {
	faCheck,
	faEye,
	faEyeSlash,
	faLock,
	faPaperPlane,
	faSpinner,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginCredentials {
	username: string;
	password: string;
}

interface LoginResponse {
	success: boolean;
	token?: string;
	message?: string;
}

const Login = () => {
	const navigate = useNavigate();
	const [credentials, setCredentials] = useState<LoginCredentials>({
		username: '',
		password: '',
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string>('');
	const [showPassword, setShowPassword] = useState(false);
	const [isHuman, setIsHuman] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);

	const handleInputChange = (
		field: keyof LoginCredentials,
		value: string,
	) => {
		setError('');
		setCredentials((prev) => ({ ...prev, [field]: value }));
	};

	const verifyHuman = async () => {
		setIsVerifying(true);
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setIsHuman(true);
		setIsVerifying(false);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!isHuman) {
			setError('Vui lòng xác nhận bạn không phải robot');
			return;
		}

		if (!credentials.username.trim() || !credentials.password.trim()) {
			setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
			return;
		}

		setIsLoading(true);
		setError('');

		try {
			const response = await axios.post<LoginResponse>(
				'/api/admin/login',
				credentials,
			);

			if (response.data.success && response.data.token) {
				if (isHuman) {
					localStorage.setItem('token', response.data.token);
				} else {
					sessionStorage.setItem('token', response.data.token);
				}
				navigate('/admin/dashboard');
			} else {
				throw new Error(response.data.message ?? 'Đăng nhập thất bại');
			}
		} catch (err) {
			if (axios.isAxiosError(err) && err.response?.data?.message) {
				setError(err.response.data.message);
			} else {
				setError('Đăng nhập thất bại. Vui lòng thử lại.');
			}
			document.getElementById('username')?.focus();
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!localStorage.getItem('token')) return;
		axios
			.post(
				'/api/admin/check-token',
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				},
			)
			.then((res) => {
				if (res.data.success && res.data.is_admin)
					navigate('/admin/vip');
				else navigate('/admin/dashboard');
			})
			.catch(() => {
				localStorage.removeItem('token');
			});
	}, [navigate]);

	return (
		<div className='relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500'>
			<div className='absolute -left-10 -top-10 z-0 h-40 w-40 animate-float rounded-full bg-white/10' />
			<div className='absolute right-20 top-40 z-0 h-24 w-24 animate-float-delayed rounded-full bg-white/10' />
			<div className='absolute bottom-20 left-1/3 z-0 h-32 w-32 animate-float rounded-full bg-white/10' />

			<div className='flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
				<div className='w-full max-w-md animate-fade-in'>
					<div className='overflow-hidden rounded-3xl bg-white/10 p-1 backdrop-blur-lg'>
						<div className='relative rounded-2xl bg-white p-8 shadow-2xl'>
							<div className='absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 opacity-20 blur-lg' />
							<div className='absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-500 opacity-20 blur-lg' />

							<div className='relative space-y-8'>
								<div className='text-center'>
									<div className='mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 p-[2px]'>
										<div className='flex h-full w-full items-center justify-center rounded-full bg-white'>
											<svg
												className='h-8 w-8'
												viewBox='0 0 24 24'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													d='M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z'
													className='fill-[url(#userIconGradient)]'
												/>
												<path
													d='M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z'
													className='fill-[url(#userIconGradient)]'
												/>
												<defs>
													<linearGradient
														id='userIconGradient'
														x1='2'
														y1='2'
														x2='22'
														y2='22'
														gradientUnits='userSpaceOnUse'
													>
														<stop className='stop-color-purple-600' />
														<stop
															offset='1'
															className='stop-color-pink-500'
														/>
													</linearGradient>
												</defs>
											</svg>
										</div>
									</div>
									<h2 className='text-2xl font-bold tracking-tight text-gray-900'>
										Đăng Nhập Quản Trị
									</h2>
									<p className='mt-2 text-sm text-gray-600'>
										Đăng nhập để truy cập trang quản trị
									</p>
								</div>

								<form
									className='space-y-6'
									onSubmit={handleSubmit}
									noValidate
								>
									{error && (
										<div
											className='animate-shake rounded-lg bg-red-50 p-4'
											role='alert'
										>
											<div className='text-sm text-red-600'>
												{error}
											</div>
										</div>
									)}

									<div className='space-y-4'>
										<div className='group relative'>
											<span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-purple-500'>
												<FontAwesomeIcon
													icon={faUser}
												/>
											</span>
											<input
												id='username'
												name='username'
												type='text'
												autoComplete='username'
												autoFocus
												required
												className='block w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
												placeholder='Tên đăng nhập'
												value={credentials.username}
												onChange={(e) =>
													handleInputChange(
														'username',
														e.target.value,
													)
												}
											/>
										</div>

										<div className='group relative'>
											<span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-purple-500'>
												<FontAwesomeIcon
													icon={faLock}
												/>
											</span>
											<input
												id='password'
												name='password'
												type={
													showPassword
														? 'text'
														: 'password'
												}
												autoComplete='current-password'
												required
												className='block w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-10 pr-12 text-gray-900 placeholder-gray-400 transition-all duration-200 ease-in-out focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
												placeholder='Mật khẩu'
												value={credentials.password}
												onChange={(e) =>
													handleInputChange(
														'password',
														e.target.value,
													)
												}
											/>
											<button
												type='button'
												onClick={() =>
													setShowPassword(
														!showPassword,
													)
												}
												tabIndex={-1}
												className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2'
												aria-label={
													showPassword
														? 'Ẩn mật khẩu'
														: 'Hiện mật khẩu'
												}
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
									<div className='flex items-center justify-between space-x-4'>
										<label className='group flex cursor-pointer items-center'>
											<div className='relative'>
												<input
													type='checkbox'
													className='sr-only'
													checked={isHuman}
													onChange={verifyHuman}
													disabled={
														isVerifying || isHuman
													}
													tabIndex={-1}
												/>
												<div className='h-5 w-5 rounded border border-gray-300 bg-white transition-all duration-200 group-hover:border-purple-500'>
													<div
														className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
															isHuman ||
															isVerifying
																? 'opacity-100'
																: 'opacity-0'
														}`}
														tabIndex={-1}
													>
														{isVerifying ? (
															<FontAwesomeIcon
																icon={faSpinner}
																className='h-3 w-3 animate-spin text-purple-500'
															/>
														) : (
															<div className='h-3 w-3 rounded-sm bg-gradient-to-r from-purple-600 to-pink-500'>
																<FontAwesomeIcon
																	icon={
																		faCheck
																	}
																	className='h-3 w-3 text-white'
																/>
															</div>
														)}
													</div>
												</div>
											</div>
											<span className='ml-2 select-none text-sm text-gray-600'>
												Tôi không phải robot
											</span>
										</label>
									</div>

									<div>
										<button
											type='submit'
											disabled={isLoading}
											className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-[2px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70'
										>
											<span className='relative block rounded-[10px] bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3.5 text-center text-sm font-semibold text-white transition-all duration-200 ease-in-out group-hover:bg-none group-focus:bg-none'>
												{isLoading ? (
													<>
														<FontAwesomeIcon
															icon={faSpinner}
															className='mr-2 animate-spin'
														/>
														Đang đăng nhập...
													</>
												) : (
													'Đăng nhập'
												)}
											</span>
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>

			<a
				href='https://t.me/MilkyWay1990'
				target='_blank'
				rel='noopener noreferrer'
				className='fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
				tabIndex={-1}
			>
				<span className='relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500'>
					<FontAwesomeIcon
						icon={faPaperPlane}
						className='h-4 w-4 text-white'
					/>
				</span>
				<span className='relative'>Hỗ trợ</span>
			</a>
		</div>
	);
};

export default Login;
