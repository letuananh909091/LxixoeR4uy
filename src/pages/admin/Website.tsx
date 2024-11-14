import Toast from '@components/Toast';
import { faGlobe, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface ConfigData {
	code_loading_time: number;
	pass_loading_time: number;
	max_pass_attempts: number;
	max_code_attempts: number;
}

const defaultConfig: ConfigData = {
	code_loading_time: 0,
	pass_loading_time: 0,
	max_pass_attempts: 0,
	max_code_attempts: 0,
};

const Website = () => {
	const [loading, setLoading] = useState(false);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [config, setConfig] = useState<ConfigData>(defaultConfig);

	const fetchConfig = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await axios.get('/api/admin/config', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const [
				,
				,
				code_loading_time,
				pass_loading_time,
				max_pass_attempts,
				max_code_attempts,
			] = response.data;

			setConfig({
				code_loading_time: Number(code_loading_time) || 0,
				pass_loading_time: Number(pass_loading_time) || 0,
				max_pass_attempts: Number(max_pass_attempts) || 0,
				max_code_attempts: Number(max_code_attempts) || 0,
			});
		} catch {
			setToastMessage('Không thể tải cấu hình');
		}
	};

	useEffect(() => {
		fetchConfig();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const token = localStorage.getItem('token');
			await axios.post('/api/admin/config', config, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setToastMessage('Cấu hình website đã được cập nhật');
			fetchConfig();
		} catch {
			setToastMessage('Không thể cập nhật cấu hình');
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setConfig((prev) => ({
			...prev,
			[name]: value === '' ? 0 : Math.max(0, parseInt(value) || 0),
		}));
	};

	return (
		<div className=''>
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
										icon={faGlobe}
										className='text-2xl text-white'
									/>
								</div>
								<h1 className='text-center text-2xl font-bold text-purple-900 sm:text-left'>
									Cấu Hình Website
								</h1>
							</div>

							<form onSubmit={handleSubmit} className='space-y-6'>
								<div className='rounded-xl border border-purple-100 bg-purple-50/50 p-4 sm:p-6'>
									<div className='space-y-4'>
										{[
											{
												id: 'code_loading_time',
												label: 'Thời Gian Load Giữa Các Lần Nhập Code (ms)',
											},
											{
												id: 'pass_loading_time',
												label: 'Thời Gian Load Giữa Các Lần Nhập Mật Khẩu (ms)',
											},
											{
												id: 'max_pass_attempts',
												label: 'Số Lần Nhập Mật Khẩu Tối Đa',
											},
											{
												id: 'max_code_attempts',
												label: 'Số Lần Nhập Code Tối Đa',
											},
										].map((field) => (
											<div
												key={field.id}
												className='group rounded-xl border border-purple-100 bg-white p-4 transition-all duration-200 hover:border-purple-200 hover:shadow-sm'
											>
												<label
													htmlFor={field.id}
													className='block text-sm font-medium text-purple-900'
												>
													{field.label}
												</label>
												<input
													type='number'
													id={field.id}
													name={field.id}
													value={
														config[
															field.id as keyof ConfigData
														]
													}
													onChange={handleInputChange}
													className='mt-2 block w-full rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 placeholder-purple-400 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
												/>
											</div>
										))}
									</div>
								</div>

								<button
									type='submit'
									disabled={loading}
									className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3.5 font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70'
								>
									<span className='relative flex items-center justify-center gap-2'>
										{loading && (
											<FontAwesomeIcon
												icon={faSpinner}
												className='animate-spin'
											/>
										)}
										{loading
											? 'Đang Cập Nhật...'
											: 'Lưu Cấu Hình'}
									</span>
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Website;
