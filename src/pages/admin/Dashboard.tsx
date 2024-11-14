import {
	faBars,
	faCog,
	faGlobe,
	faPaperPlane,
	faServer,
	faSignOutAlt,
	faTimes,
	faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { FC, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const Dashboard: FC = () => {
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const telegramMessage = encodeURIComponent(`Server ${name} có vấn đề`);

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/admin');
	};

	const navItems = [
		{
			path: '',
			icon: faServer,
			label: `VPS ${name}`,
		},
		{
			path: 'domain',
			icon: faGlobe,
			label: 'Cài Đặt Domain',
		},
		{
			path: 'telegram',
			icon: faPaperPlane,
			label: 'Cấu Hình Telegram',
		},
		{
			path: 'website',
			icon: faCog,
			label: 'Cài Đặt Website',
		},
		{
			path: 'account',
			icon: faUser,
			label: 'Thông Tin Tài Khoản',
		},
	];

	useEffect(() => {
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
				if (res.data.is_admin) navigate('/admin/vip');
			})
			.catch(() => {
				localStorage.removeItem('token');
				navigate('/admin');
			});
		axios
			.post(
				'/api/admin/get-info',
				{},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				},
			)
			.then((res) => {
				if (res.data.name === 'admin') navigate('/admin/vip');
				else setName(res.data.name);
			});
	}, [navigate]);

	return (
		<div className='relative min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500'>
			{/* Animated background elements */}
			<div className='absolute -left-10 -top-10 z-0 h-40 w-40 animate-float rounded-full bg-white/10' />
			<div className='absolute right-20 top-40 z-0 h-24 w-24 animate-float-delayed rounded-full bg-white/10' />
			<div className='absolute bottom-20 left-1/3 z-0 h-32 w-32 animate-float rounded-full bg-white/10' />

			{/* Top Navigation Bar */}
			<nav className='fixed left-0 right-0 top-0 z-50 bg-white/95 shadow-lg backdrop-blur-lg'>
				<div className='mx-auto px-4'>
					<div className='flex h-16 items-center justify-between'>
						{/* Logo/Brand */}
						<div className='flex items-center'>
							<h1 className='bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-xl font-bold text-transparent'>
								Dashboard
							</h1>
						</div>

						{/* Desktop Navigation */}
						<div className='hidden items-center space-x-1 md:flex'>
							{navItems.map((item) => {
								const isActive =
									location.pathname ===
									`/admin/dashboard/${item.path}`;
								return (
									<Link
										key={item.path}
										to={item.path}
										className={`flex items-center rounded-lg px-4 py-2 transition-all duration-200 ${
											isActive
												? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
												: 'text-purple-900 hover:bg-purple-50'
										}`}
									>
										<FontAwesomeIcon
											icon={item.icon}
											className={`h-4 w-4 ${isActive ? 'text-white' : 'text-purple-500'}`}
										/>
										<span className='ml-2 font-medium'>
											{item.label}
										</span>
									</Link>
								);
							})}
							<button
								onClick={handleLogout}
								className='flex items-center rounded-lg px-4 py-2 text-purple-900 transition-all duration-200 hover:bg-purple-50'
							>
								<FontAwesomeIcon
									icon={faSignOutAlt}
									className='h-4 w-4 text-purple-500'
								/>
								<span className='ml-2 font-medium'>
									Đăng Xuất
								</span>
							</button>
						</div>

						{/* Mobile menu button */}
						<div className='md:hidden'>
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className='inline-flex items-center justify-center rounded-lg p-2 text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500'
							>
								<FontAwesomeIcon
									icon={isMenuOpen ? faTimes : faBars}
									className='h-6 w-6'
								/>
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Navigation */}
				<div
					className={`fixed inset-x-0 top-16 z-40 transform overflow-hidden bg-white/95 backdrop-blur-lg transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-[120%] opacity-0'} `}
				>
					<div
						className={`space-y-2 p-4 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMenuOpen ? 'translate-y-0' : '-translate-y-10'} `}
					>
						{navItems.map((item, index) => {
							const isActive =
								location.pathname ===
								`/admin/dashboard/${item.path}`;
							return (
								<Link
									key={item.path}
									to={item.path}
									onClick={() => setIsMenuOpen(false)}
									className={`flex transform items-center rounded-lg px-3 py-2.5 transition-all duration-300 ${
										isActive
											? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
											: 'text-purple-900 hover:bg-purple-50 active:scale-95'
									} `}
									style={{
										opacity: isMenuOpen ? 1 : 0,
										transform: `translateY(${isMenuOpen ? 0 : 20}px)`,
										transition: `
											transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 60}ms,
											opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 60}ms
										`,
									}}
								>
									<FontAwesomeIcon
										icon={item.icon}
										className={`h-4 w-4 ${isActive ? 'text-white' : 'text-purple-500'}`}
									/>
									<span className='ml-2 font-medium'>
										{item.label}
									</span>
								</Link>
							);
						})}
						<button
							onClick={() => {
								setIsMenuOpen(false);
								handleLogout();
							}}
							className='flex w-full transform items-center rounded-lg px-3 py-2.5 text-purple-900 transition-all duration-300 hover:bg-purple-50 active:scale-95'
							style={{
								opacity: isMenuOpen ? 1 : 0,
								transform: `translateY(${isMenuOpen ? 0 : 20}px)`,
								transition: `
									transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${navItems.length * 60}ms,
									opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${navItems.length * 60}ms
								`,
							}}
						>
							<FontAwesomeIcon
								icon={faSignOutAlt}
								className='h-4 w-4 text-purple-500'
							/>
							<span className='ml-2 font-medium'>Đăng Xuất</span>
						</button>
					</div>
				</div>
			</nav>

			{/* Main content */}
			<div className='pt-20'>
				<div className='animate-fade-in p-4 lg:p-8'>
					<div className='rounded-2xl'>
						<Outlet />
					</div>
				</div>
			</div>

			{/* Help button */}
			<a
				href={`https://t.me/MilkyWay1990?text=${telegramMessage}`}
				target='_blank'
				rel='noopener noreferrer'
				className='fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-full bg-white/90 px-6 py-3 text-sm font-medium text-purple-900 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
			>
				<span className='relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500'>
					<FontAwesomeIcon
						icon={faPaperPlane}
						className='h-4 w-4 text-white'
					/>
				</span>
				<span className='relative'>Trợ Giúp</span>
			</a>

			{/* Overlay for mobile menu */}
			<div
				className={`fixed inset-0 z-30 backdrop-blur-[2px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
					isMenuOpen
						? 'bg-black/30 backdrop-blur-[2px]'
						: 'pointer-events-none bg-black/0 backdrop-blur-none'
				} `}
				onClick={() => setIsMenuOpen(false)}
			/>
		</div>
	);
};

export default Dashboard;
