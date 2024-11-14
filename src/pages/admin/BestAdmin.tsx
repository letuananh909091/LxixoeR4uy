import {
	faBars,
	faCheck,
	faDownload,
	faEdit,
	faEye,
	faEyeSlash,
	faImage,
	faInfo,
	faPlus,
	faSearch,
	faSignOutAlt,
	faSortDown,
	faSortUp,
	faTimes,
	faTrash,
	faUser,
	faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type VPSUser = {
	name: string;
	username: string;
	password: string;
	ip: string;
};

type DeleteConfirmModal = {
	isOpen: boolean;
	userName: string;
};

type SortField = 'name' | 'username' | 'stt' | 'ip';
type SortDirection = 'asc' | 'desc';

type ImageInfo = {
	created: string;
	filename: string;
	url: string;
};

type SelectedImages = {
	[key: string]: boolean;
};

type ImageModalType = {
	isOpen: boolean;
	image: ImageInfo | null;
};

type ToastType = 'success' | 'error' | 'info';

type ToastState = {
	message: string | null;
	type: ToastType;
};

const CustomCheckbox = ({
	checked,
	onChange,
	selectAll,
}: {
	checked: boolean;
	onChange: () => void;
	selectAll: boolean;
}) => {
	return (
		<label className='group flex cursor-pointer items-center'>
			<div className='relative'>
				<input
					type='checkbox'
					className='sr-only'
					checked={checked}
					onChange={onChange}
					tabIndex={-1}
				/>
				<div className='h-5 w-5 rounded border border-gray-300 bg-white transition-all duration-200 group-hover:border-purple-500'>
					<div
						className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
							checked ? 'opacity-100' : 'opacity-0'
						}`}
					>
						<div className='h-3 w-3 rounded-sm bg-gradient-to-r from-purple-600 to-pink-500'>
							<FontAwesomeIcon
								icon={faCheck}
								className='h-3 w-3 text-white'
							/>
						</div>
					</div>
				</div>
			</div>
			{selectAll && (
				<span className='ml-2 select-none text-sm text-gray-600'>
					{checked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
				</span>
			)}
		</label>
	);
};

const BestAdmin = () => {
	const [activeTab, setActiveTab] = useState<'vps' | 'profile' | 'images'>(
		'vps',
	);
	const [users, setUsers] = useState<VPSUser[]>([]);
	const [newVPSName, setNewVPSName] = useState('');
	const [myUsername, setMyUsername] = useState('');
	const [myPassword, setMyPassword] = useState('');
	const [editUser, setEditUser] = useState<VPSUser | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const token = localStorage.getItem('token');
	const navigate = useNavigate();
	const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmModal>({
		isOpen: false,
		userName: '',
	});
	const [toast, setToast] = useState<ToastState>({
		message: null,
		type: 'info',
	});
	const vpsNameInputRef = useRef<HTMLInputElement>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortField, setSortField] = useState<SortField>('name');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
	const [vpsCount, setVpsCount] = useState(0);
	const [showMyPassword, setShowMyPassword] = useState(false);
	const [showEditPassword, setShowEditPassword] = useState(false);
	const [images, setImages] = useState<ImageInfo[]>([]);
	const [imageSearchTerm, setImageSearchTerm] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [imagesPerPage] = useState(12);
	const [deleteImageConfirm, setDeleteImageConfirm] = useState<{
		isOpen: boolean;
		filename: string;
	}>({
		isOpen: false,
		filename: '',
	});
	const [selectedImages, setSelectedImages] = useState<SelectedImages>({});
	const [selectAll, setSelectAll] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [imageModal, setImageModal] = useState<ImageModalType>({
		isOpen: false,
		image: null,
	});

	const sortUsers = (users: VPSUser[]) => {
		return [...users].sort((a, b) => {
			if (sortField === 'stt') {
				return sortDirection === 'asc' ? 1 : -1;
			}
			const aValue = a[sortField];
			const bValue = b[sortField];
			return sortDirection === 'asc'
				? String(aValue).localeCompare(String(bValue))
				: String(bValue).localeCompare(String(aValue));
		});
	};

	const filterUsers = (users: VPSUser[]) => {
		return users.filter(
			(user) =>
				user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.username
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				user.ip.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	};

	const fetchUsers = useCallback(async () => {
		try {
			const response = await axios.get('/api/admin/get-list-user', {
				headers: { Authorization: `Bearer ${token}` },
			});
			const ips = [
				'203.160.0.34',
				'203.160.1.72',
				'203.160.5.231',
				'203.160.6.88',
				'203.160.7.19',
				'203.160.8.203',
				'203.160.10.150',
				'203.160.12.47',
				'203.160.15.223',
				'203.160.17.66',
				'14.162.1.112',
				'14.162.3.65',
				'14.162.4.239',
				'14.162.5.188',
				'14.162.6.99',
				'14.162.7.144',
				'14.162.8.53',
				'14.162.10.230',
				'14.162.12.19',
				'14.162.15.95',
				'27.68.2.171',
				'27.68.3.214',
				'27.68.4.47',
				'27.68.5.131',
				'27.68.7.200',
				'27.68.8.36',
				'27.68.9.110',
				'27.68.11.222',
				'27.68.12.67',
				'27.68.15.245',
				'171.224.3.158',
				'171.224.4.22',
				'171.224.6.99',
				'171.224.8.199',
				'171.224.10.55',
				'171.224.12.34',
				'171.224.14.176',
			];
			const formattedUsers = response.data.map(
				(user: string[], index: number) => ({
					name: user[0],
					username: user[1],
					password: user[2],
					ip: index < ips.length ? ips[index] : '',
				}),
			);
			setUsers(formattedUsers);
			setVpsCount(formattedUsers.length);
		} catch (error) {
			console.error('Failed to fetch users:', error);
		}
	}, [token]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleAddUser = async () => {
		if (!newVPSName.trim()) {
			setToast({ message: 'Vui lòng nhập tên VPS', type: 'info' });
			vpsNameInputRef.current?.focus();
			return;
		}

		if (vpsCount >= 1) {
			setToast({
				message:
					'Không đủ VPS để khởi tạo, vui lòng xoá hoặc mua thêm VPS',
				type: 'info',
			});
			window.open('https://ovfteam.com/', '_blank');
			return;
		}

		try {
			await axios.post(
				'/api/admin/add-user',
				{ name: newVPSName },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setNewVPSName('');
			fetchUsers();
		} catch (error) {
			console.error('Failed to add user:', error);
			setToast({ message: 'Không thể thêm VPS', type: 'error' });
		}
	};

	const handleChangePassword = async (
		name: string,
		username: string,
		password: string,
	) => {
		try {
			await axios.post(
				'/api/admin/change-password',
				{ name, username, password },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setEditUser(null);
			fetchUsers();
		} catch (error) {
			console.error('Failed to change password:', error);
		}
	};

	const handleChangeMyInfo = async () => {
		try {
			await axios.post(
				'/api/admin/change-password',
				{ username: myUsername, password: myPassword },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
		} catch (error) {
			console.error('Failed to change info:', error);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		window.location.href = '/admin';
	};

	useEffect(() => {
		axios
			.post(
				'/api/admin/check-token',
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			)
			.then((res) => {
				if (!res.data.is_admin) navigate('/admin/dashboard');
			})
			.catch(() => {
				localStorage.removeItem('token');
				navigate('/admin');
			});
	}, [navigate, token]);

	const handleEditUser = async (user: VPSUser) => {
		setIsLoading(true);
		try {
			const response = await axios.post(
				'/api/admin/get-info',
				{ name: user.name },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setEditUser({
				name: user.name,
				username: response.data[0],
				password: response.data[1],
				ip: user.ip,
			});
		} catch (error) {
			console.error('Failed to fetch user details:', error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const fetchMyInfo = async () => {
			if (activeTab === 'profile') {
				try {
					const response = await axios.post(
						'/api/admin/get-info',
						{ name: 'admin' },
						{ headers: { Authorization: `Bearer ${token}` } },
					);

					setMyUsername(response.data[0]);
					setMyPassword(response.data[1]);
				} catch (error) {
					console.error('Failed to fetch admin info:', error);
				}
			}
		};

		fetchMyInfo();
	}, [activeTab, token]);

	const handleDeleteUser = async (name: string) => {
		setDeleteConfirm({ isOpen: true, userName: name });
	};

	const confirmDelete = async () => {
		try {
			await axios.post(
				'/api/admin/delete-user',
				{ name: deleteConfirm.userName },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setDeleteConfirm({ isOpen: false, userName: '' });
			fetchUsers();
		} catch (error) {
			console.error('Failed to delete user:', error);
		}
	};

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	};

	const fetchImages = useCallback(async () => {
		try {
			const response = await axios.get('/api/get-all-images', {
				headers: { Authorization: `Bearer ${token}` },
			});
			setImages(response.data);
		} catch (error) {
			console.error('Failed to fetch images:', error);
			setToast({ message: 'Không thể tải hình ảnh', type: 'error' });
		}
	}, [token]);

	const handleDeleteImage = async (filename: string) => {
		setDeleteImageConfirm({ isOpen: true, filename });
	};

	const confirmDeleteImage = async () => {
		try {
			const filenames = deleteImageConfirm.filename.split(', ');
			for (const filename of filenames) {
				await axios.post(
					'/api/delete-image',
					{ filename },
					{ headers: { Authorization: `Bearer ${token}` } },
				);
			}
			setDeleteImageConfirm({ isOpen: false, filename: '' });
			setSelectedImages({});
			setSelectAll(false);
			fetchImages();
			setToast({ message: 'Xóa hình ảnh thành công', type: 'success' });
		} catch (error) {
			console.error('Failed to delete images:', error);
			setToast({ message: 'Không thể xóa hình ảnh', type: 'error' });
		}
	};

	const handleDownloadImage = async (filename: string) => {
		try {
			const response = await axios.get(`/uploads/${filename}`, {
				headers: { Authorization: `Bearer ${token}` },
				responseType: 'blob',
			});

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', filename);
			document.body.appendChild(link);
			link.click();

			link.parentNode?.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Failed to download image:', error);
			setToast({ message: 'Không th tải hình ảnh', type: 'error' });
		}
	};

	useEffect(() => {
		if (activeTab === 'images') {
			fetchImages();
		}
	}, [activeTab, fetchImages]);

	const handleSelectAll = () => {
		const newSelectAll = !selectAll;
		setSelectAll(newSelectAll);

		const newSelectedImages: SelectedImages = {};
		images.forEach((image) => {
			newSelectedImages[image.filename] = newSelectAll;
		});
		setSelectedImages(newSelectedImages);
	};

	const handleSelectImage = (filename: string) => {
		setSelectedImages((prev) => {
			const newSelectedImages = {
				...prev,
				[filename]: !prev[filename],
			};

			const allSelected = images.every(
				(image) => newSelectedImages[image.filename],
			);

			setSelectAll(allSelected);
			return newSelectedImages;
		});
	};

	const getSelectedImagesCount = () => {
		return Object.values(selectedImages).filter(Boolean).length;
	};

	const handleBulkDownload = async () => {
		const selectedFiles = Object.entries(selectedImages)
			.filter(([, isSelected]) => isSelected)
			.map(([filename]) => filename);

		if (selectedFiles.length === 0) {
			setToast({
				message: 'Vui lòng chọn ít nhất một hình ảnh',
				type: 'info',
			});
			return;
		}

		for (const filename of selectedFiles) {
			await handleDownloadImage(filename);
		}
	};

	const handleBulkDelete = () => {
		const selectedFiles = Object.entries(selectedImages)
			.filter(([, isSelected]) => isSelected)
			.map(([filename]) => filename);

		if (selectedFiles.length === 0) {
			setToast({
				message: 'Vui lòng chọn ít nhất một hình ảnh',
				type: 'info',
			});
			return;
		}

		setDeleteImageConfirm({
			isOpen: true,
			filename: selectedFiles.join(', '),
		});
	};

	const handleImageClick = (image: ImageInfo) => {
		setImageModal({
			isOpen: true,
			image,
		});
	};

	return (
		<div className='fixed inset-0 overflow-y-auto bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500'>
			<div className='min-h-screen'>
				<div className='fixed -left-10 -top-10 z-0 h-40 w-40 animate-float rounded-full bg-white/20' />
				<div className='fixed right-20 top-40 z-0 h-24 w-24 animate-float-delayed rounded-full bg-pink-500/20' />
				<div className='fixed bottom-20 left-1/3 z-0 h-32 w-32 animate-float rounded-full bg-indigo-500/20' />

				<div className='fixed left-1/4 top-1/4 z-0 h-16 w-16 animate-float-slow rounded-full bg-purple-400/10' />
				<div className='fixed right-1/3 top-1/2 z-0 h-20 w-20 animate-float-slower rounded-full bg-pink-400/10' />
				<div className='fixed bottom-1/4 left-2/3 z-0 h-28 w-28 animate-float-slowest rounded-full bg-indigo-400/10' />

				<div className='fixed right-1/4 top-1/3 z-0 h-4 w-4 animate-pulse rounded-full bg-white/30' />
				<div className='fixed bottom-1/3 left-1/2 z-0 h-3 w-3 animate-pulse rounded-full bg-pink-300/30' />
				<div className='fixed right-1/2 top-2/3 z-0 h-5 w-5 animate-pulse rounded-full bg-indigo-300/30' />

				<div className='fixed left-1/3 top-1/3 z-0 h-36 w-36 animate-float-reverse rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-xl' />
				<div className='fixed bottom-1/4 right-1/4 z-0 h-48 w-48 animate-float-delayed-reverse rounded-full bg-gradient-to-br from-pink-500/20 to-transparent blur-xl' />
				<div className='fixed bottom-1/2 left-1/4 z-0 h-40 w-40 animate-float-slow-reverse rounded-full bg-gradient-to-br from-indigo-500/20 to-transparent blur-xl' />

				<nav className='sticky top-0 z-20 bg-white/10 backdrop-blur-lg'>
					<div className='mx-auto max-w-7xl px-4'>
						<div className='flex h-16 items-center justify-between'>
							<button
								onClick={() => setIsDrawerOpen(true)}
								className='inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 sm:hidden'
							>
								<FontAwesomeIcon
									icon={faBars}
									className='h-6 w-6'
								/>
							</button>

							<div className='hidden sm:flex sm:space-x-2'>
								{[
									{
										id: 'vps',
										icon: faUsers,
										label: 'Danh Sách VPS',
									},
									{
										id: 'profile',
										icon: faUser,
										label: 'Tài Khoản',
									},
									{
										id: 'images',
										icon: faImage,
										label: 'Hình Ảnh',
									},
								].map((tab) => (
									<button
										key={tab.id}
										onClick={() =>
											setActiveTab(
												tab.id as typeof activeTab,
											)
										}
										className={`group relative inline-flex items-center rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
											activeTab === tab.id
												? 'bg-white/30 text-white shadow-lg'
												: 'text-white/70 hover:bg-white/10 hover:text-white'
										}`}
									>
										<FontAwesomeIcon
											icon={tab.icon}
											className={`mr-2 transition-transform duration-300 ${
												activeTab === tab.id
													? 'scale-110'
													: 'group-hover:scale-110'
											}`}
										/>
										{tab.label}
									</button>
								))}
							</div>

							<button
								onClick={handleLogout}
								className='group relative hidden h-10 items-center overflow-hidden rounded-xl border border-white/10 bg-white/10 px-6 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 sm:inline-flex'
							>
								<span className='relative flex items-center text-sm font-medium text-white'>
									<FontAwesomeIcon
										icon={faSignOutAlt}
										className='mr-2 transition-transform duration-200 group-hover:-translate-x-0.5'
									/>
									<span className='transition-transform duration-200 group-hover:-translate-x-0.5'>
										Đăng Xuất
									</span>
								</span>
							</button>
						</div>
					</div>
				</nav>

				{isDrawerOpen && (
					<div className='fixed inset-0 z-[100] overflow-hidden'>
						<div
							className='absolute inset-0 bg-purple-900/30 backdrop-blur-md'
							onClick={() => setIsDrawerOpen(false)}
						/>

						<div
							className={`absolute inset-y-0 left-0 w-72 transform transition-transform duration-300 ease-in-out ${
								isDrawerOpen
									? 'translate-x-0'
									: '-translate-x-full'
							}`}
						>
							<div className='flex h-full flex-col overflow-y-auto bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 shadow-2xl'>
								<div className='flex items-center justify-between'>
									<span className='bg-gradient-to-r from-white to-white/80 bg-clip-text text-lg font-bold text-transparent'>
										Menu
									</span>
									<button
										onClick={() => setIsDrawerOpen(false)}
										className='rounded-xl bg-white/10 p-2 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20'
									>
										<FontAwesomeIcon
											icon={faTimes}
											className='h-6 w-6'
										/>
									</button>
								</div>

								<div className='mt-8 flex flex-col space-y-2'>
									{[
										{
											id: 'vps',
											icon: faUsers,
											label: 'Danh Sách VPS',
										},
										{
											id: 'profile',
											icon: faUser,
											label: 'Tài Khoản',
										},
										{
											id: 'images',
											icon: faImage,
											label: 'Hình Ảnh',
										},
									].map((tab) => (
										<button
											key={tab.id}
											onClick={() => {
												setActiveTab(
													tab.id as typeof activeTab,
												);
												setIsDrawerOpen(false);
											}}
											className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
												activeTab === tab.id
													? 'bg-white/20 text-white shadow-lg'
													: 'text-white/70 hover:bg-white/10 hover:text-white'
											}`}
										>
											<FontAwesomeIcon
												icon={tab.icon}
												className={`mr-3 transition-transform duration-200 ${
													activeTab === tab.id
														? 'scale-110'
														: ''
												}`}
											/>
											{tab.label}
											{activeTab === tab.id && (
												<div className='ml-auto h-2 w-2 rounded-full bg-white' />
											)}
										</button>
									))}
								</div>

								<div className='mt-auto pt-6'>
									<div className='mb-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />
									<button
										onClick={handleLogout}
										className='flex w-full items-center rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/20 hover:text-white'
									>
										<FontAwesomeIcon
											icon={faSignOutAlt}
											className='mr-3'
										/>
										Đăng Xuất
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				<main className='relative z-10 p-4 sm:p-6 lg:p-8'>
					<div className='mx-auto max-w-7xl'>
						<div className='overflow-hidden rounded-3xl bg-white/10 p-1 backdrop-blur-lg'>
							<div className='relative rounded-2xl bg-white p-4 shadow-2xl sm:p-8'>
								{activeTab === 'vps' && (
									<div className='flex flex-col space-y-6'>
										<div className='flex flex-col space-y-4'>
											<div className='flex flex-col gap-4 lg:flex-row'>
												<div className='relative flex-1'>
													<FontAwesomeIcon
														icon={faSearch}
														className='absolute left-3 top-1/2 -translate-y-1/2 text-purple-400'
													/>
													<input
														type='text'
														value={searchTerm}
														onChange={(e) =>
															setSearchTerm(
																e.target.value,
															)
														}
														placeholder='Tìm kiếm VPS... (Tên VPS, Tên Đăng Nhập, IP)'
														className='w-full rounded-xl border border-purple-200 bg-purple-50/50 py-3.5 pl-10 pr-4 text-sm text-purple-900 transition-all duration-200 ease-in-out placeholder:text-purple-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
													/>
												</div>
												<form
													onSubmit={(e) => {
														e.preventDefault();
														handleAddUser();
													}}
													className='flex flex-1 flex-col gap-4 lg:flex-row'
												>
													<input
														ref={vpsNameInputRef}
														type='text'
														value={newVPSName}
														onChange={(e) =>
															setNewVPSName(
																e.target.value,
															)
														}
														placeholder='Tên VPS'
														className='flex-1 rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3.5 text-sm text-purple-900 transition-all duration-200 ease-in-out placeholder:text-purple-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
													/>
													<button
														type='submit'
														disabled={vpsCount >= 1}
														className={`whitespace-nowrap rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
															vpsCount >= 1
																? ''
																: 'hover:translate-y-[-1px]'
														}`}
													>
														<FontAwesomeIcon
															icon={faPlus}
															className='mr-2'
														/>
														Khởi Tạo VPS{' '}
														{vpsCount + 1}
													</button>
												</form>
											</div>

											<div className='rounded-xl border border-purple-100 bg-white shadow-sm'>
												{users.length === 0 ? (
													<div className='flex flex-col items-center justify-center py-16'>
														<div className='relative mb-8 h-32 w-32'>
															<div className='absolute inset-0 animate-float rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-xl' />
															<div className='relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-xl'>
																<FontAwesomeIcon
																	icon={
																		faUsers
																	}
																	className='text-4xl text-pink-500'
																/>
															</div>
														</div>
														<h3 className='mb-2 text-xl font-semibold text-purple-900'>
															Chưa có VPS nào được
															khởi tạo
														</h3>
														<p className='mb-8 text-center text-purple-500'>
															Bắt đầu bằng cách
															thêm VPS đầu tiên
															của bạn.
															<br />
															Nhấn nút "Khởi Tạo
															VPS" ở trên để bắt
															đầu.
														</p>
													</div>
												) : (
													<div className='overflow-x-auto'>
														<table className='min-w-full divide-y divide-purple-200'>
															<thead className='bg-gradient-to-r from-purple-50 to-pink-50'>
																<tr>
																	{[
																		{
																			id: 'stt',
																			label: 'STT',
																		},
																		{
																			id: 'name',
																			label: 'Tên',
																		},
																		{
																			id: 'username',
																			label: 'Tên Đăng Nhập',
																		},
																		{
																			id: 'password',
																			label: 'Mật Khẩu',
																		},
																		{
																			id: 'ip',
																			label: 'IP',
																		},
																		{
																			id: 'actions',
																			label: 'Thao Tác',
																		},
																	].map(
																		(
																			column,
																		) => (
																			<th
																				key={
																					column.id
																				}
																				onClick={() => {
																					if (
																						[
																							'name',
																							'username',
																							'stt',
																							'ip',
																						].includes(
																							column.id,
																						)
																					) {
																						handleSort(
																							column.id as SortField,
																						);
																					}
																				}}
																				className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-purple-500 ${
																					[
																						'name',
																						'username',
																						'stt',
																						'ip',
																					].includes(
																						column.id,
																					)
																						? 'cursor-pointer hover:text-purple-700'
																						: ''
																				}`}
																			>
																				<div className='flex items-center'>
																					{
																						column.label
																					}
																					{sortField ===
																						column.id && (
																						<FontAwesomeIcon
																							icon={
																								sortDirection ===
																								'asc'
																									? faSortUp
																									: faSortDown
																							}
																							className='ml-2'
																						/>
																					)}
																				</div>
																			</th>
																		),
																	)}
																</tr>
															</thead>
															<tbody className='divide-y divide-purple-100'>
																{sortUsers(
																	filterUsers(
																		users,
																	),
																).length ===
																0 ? (
																	<tr>
																		<td
																			colSpan={
																				6
																			}
																		>
																			<div className='flex flex-col items-center justify-center py-16'>
																				<div className='relative mb-8 h-32 w-32'>
																					<div className='absolute inset-0 animate-float rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-xl' />
																					<div className='relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-xl'>
																						<FontAwesomeIcon
																							icon={
																								faSearch
																							}
																							className='text-4xl text-pink-500'
																						/>
																					</div>
																				</div>
																				<h3 className='mb-2 text-xl font-semibold text-purple-900'>
																					Không
																					tìm
																					thấy
																					kết
																					quả
																				</h3>
																				<p className='text-center text-purple-500'>
																					Không
																					tìm
																					thy
																					VPS
																					nào
																					khớp
																					với
																					từ
																					khóa
																					tìm
																					kiếm.
																					<br />
																					Vui
																					lòng
																					ử
																					lại
																					với
																					từ
																					khóa
																					khác.
																				</p>
																			</div>
																		</td>
																	</tr>
																) : (
																	sortUsers(
																		filterUsers(
																			users,
																		),
																	).map(
																		(
																			user,
																		) => (
																			<tr
																				key={
																					user.name
																				}
																				className='group transition-colors duration-150 hover:bg-purple-50/50'
																			>
																				<td className='whitespace-nowrap px-6 py-4 text-sm font-semibold text-purple-900'>
																					{
																						user.name
																					}
																				</td>
																				<td className='whitespace-nowrap px-6 py-4 text-sm text-purple-700'>
																					{
																						user.name
																					}
																				</td>
																				<td className='whitespace-nowrap px-6 py-4 text-sm text-purple-700'>
																					{
																						user.username
																					}
																				</td>
																				<td className='whitespace-nowrap px-6 py-4 text-sm text-purple-700'>
																					{
																						user.password
																					}
																				</td>
																				<td className='whitespace-nowrap px-6 py-4 text-sm text-purple-700'>
																					{
																						user.ip
																					}
																				</td>
																				<td className='whitespace-nowrap px-6 py-4'>
																					<div className='flex space-x-2 sm:hidden'>
																						<button
																							onClick={() =>
																								handleEditUser(
																									user,
																								)
																							}
																							className='flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 transition-colors hover:bg-purple-100'
																							title='Chỉnh sửa'
																						>
																							<FontAwesomeIcon
																								icon={
																									faEdit
																								}
																								className='h-4 w-4'
																							/>
																						</button>
																						<button
																							onClick={() =>
																								handleDeleteUser(
																									user.name,
																								)
																							}
																							className='flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 transition-colors hover:bg-purple-100'
																							title='Xóa'
																						>
																							<FontAwesomeIcon
																								icon={
																									faTrash
																								}
																								className='h-4 w-4'
																							/>
																						</button>
																					</div>

																					<div className='hidden space-x-3 sm:flex'>
																						<button
																							onClick={() =>
																								handleEditUser(
																									user,
																								)
																							}
																							className='rounded-lg p-2 text-purple-600 opacity-0 transition-all duration-200 hover:bg-purple-100 group-hover:opacity-100'
																							title='Chỉnh sửa'
																						>
																							<FontAwesomeIcon
																								icon={
																									faEdit
																								}
																							/>
																						</button>
																						<button
																							onClick={() =>
																								handleDeleteUser(
																									user.name,
																								)
																							}
																							className='rounded-lg p-2 text-purple-600 opacity-0 transition-all duration-200 hover:bg-purple-100 group-hover:opacity-100'
																							title='Xóa'
																						>
																							<FontAwesomeIcon
																								icon={
																									faTrash
																								}
																							/>
																						</button>
																					</div>
																				</td>
																			</tr>
																		),
																	)
																)}
															</tbody>
														</table>
													</div>
												)}
											</div>
										</div>
									</div>
								)}

								{activeTab === 'profile' && (
									<div className='flex flex-col space-y-6'>
										<h2 className='text-xl font-semibold text-purple-900'>
											Thay Đổi Thông Tin Tài Khoản
										</h2>
										<div className='space-y-4'>
											<div className='group relative'>
												<label className='mb-1 block text-sm font-medium text-purple-700'>
													Tên Đăng Nhập
												</label>
												<input
													type='text'
													value={myUsername}
													onChange={(e) =>
														setMyUsername(
															e.target.value,
														)
													}
													className='w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3.5 text-sm text-purple-900 transition-all duration-200 ease-in-out placeholder:text-purple-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
												/>
											</div>
											<div className='group relative'>
												<label className='mb-1 block text-sm font-medium text-purple-700'>
													Mật Khẩu
												</label>
												<div className='relative'>
													<input
														type={
															showMyPassword
																? 'text'
																: 'password'
														}
														value={myPassword}
														onChange={(e) =>
															setMyPassword(
																e.target.value,
															)
														}
														className='w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3.5 pr-12 text-sm text-purple-900 transition-all duration-200 ease-in-out placeholder:text-purple-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
													/>
													<button
														type='button'
														onClick={() =>
															setShowMyPassword(
																!showMyPassword,
															)
														}
														className='absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600'
													>
														<FontAwesomeIcon
															icon={
																showMyPassword
																	? faEyeSlash
																	: faEye
															}
														/>
													</button>
												</div>
											</div>
											<button
												onClick={handleChangeMyInfo}
												className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-[2px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 sm:w-auto'
											>
												<span className='relative block rounded-[10px] bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out group-hover:bg-none'>
													Lưu Thay Đổi
												</span>
											</button>
										</div>
									</div>
								)}

								{activeTab === 'images' && (
									<div className='space-y-6'>
										<div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between'>
											<h2 className='text-xl font-semibold text-purple-900'>
												Quản Lý Hình Ảnh
											</h2>
											<div className='flex flex-col gap-2 sm:flex-row sm:gap-4'>
												<button
													onClick={handleBulkDownload}
													className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-[2px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
												>
													<span className='relative block rounded-[10px] bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ease-in-out group-hover:bg-none'>
														<FontAwesomeIcon
															icon={faDownload}
															className='mr-2'
														/>
														{`Tải xuống ${getSelectedImagesCount()} hình ảnh`}
													</span>
												</button>
												<button
													onClick={handleBulkDelete}
													className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-[2px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
												>
													<span className='relative block rounded-[10px] bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ease-in-out group-hover:bg-none'>
														<FontAwesomeIcon
															icon={faTrash}
															className='mr-2'
														/>
														{`Xóa ${getSelectedImagesCount()} hình ảnh`}
													</span>
												</button>
											</div>
										</div>

										<div className='space-y-4'>
											<div className='relative'>
												<FontAwesomeIcon
													icon={faSearch}
													className='absolute left-3 top-1/2 -translate-y-1/2 text-purple-400'
												/>
												<input
													type='text'
													value={imageSearchTerm}
													onChange={(e) =>
														setImageSearchTerm(
															e.target.value,
														)
													}
													placeholder='Tìm kiếm hình ảnh...'
													className='w-full rounded-xl border border-purple-200 bg-purple-50/50 py-3.5 pl-10 pr-4 text-sm text-purple-900 transition-all duration-200 ease-in-out placeholder:text-purple-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
												/>
											</div>
											<div className='flex items-center'>
												<CustomCheckbox
													checked={selectAll}
													onChange={handleSelectAll}
													selectAll={true}
												/>
											</div>
										</div>

										<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
											{images
												.filter((img) =>
													img.filename
														.toLowerCase()
														.includes(
															imageSearchTerm.toLowerCase(),
														),
												)
												.slice(
													(currentPage - 1) *
														imagesPerPage,
													currentPage * imagesPerPage,
												)
												.map((image) => (
													<div
														key={image.filename}
														className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-[2px] transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20'
													>
														<div className='relative flex h-full flex-col rounded-[10px] bg-white'>
															<div className='absolute right-3 top-3 z-20'>
																<div
																	className='relative'
																	onClick={(
																		e,
																	) =>
																		e.stopPropagation()
																	}
																>
																	<CustomCheckbox
																		checked={
																			selectedImages[
																				image
																					.filename
																			] ||
																			false
																		}
																		onChange={() =>
																			handleSelectImage(
																				image.filename,
																			)
																		}
																		selectAll={
																			false
																		}
																	/>
																</div>
															</div>
															<div
																onClick={() =>
																	handleImageClick(
																		image,
																	)
																}
																className='group relative aspect-square cursor-pointer overflow-hidden rounded-t-[10px]'
															>
																<div className='absolute inset-0 flex items-center justify-center bg-gray-100'>
																	<div className='h-full w-full'>
																		<img
																			src={
																				image.url +
																				'?token=' +
																				token
																			}
																			alt={
																				image.filename
																			}
																			className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
																		/>
																	</div>
																</div>
																<div className='absolute bottom-3 right-3 z-10 flex gap-2 sm:hidden'>
																	<button
																		onClick={(
																			e,
																		) => {
																			e.stopPropagation();
																			handleDownloadImage(
																				image.filename,
																			);
																		}}
																		className='flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform active:scale-95'
																		title='Tải xuống'
																	>
																		<FontAwesomeIcon
																			icon={
																				faDownload
																			}
																			className='h-4 w-4'
																		/>
																	</button>
																	<button
																		onClick={(
																			e,
																		) => {
																			e.stopPropagation();
																			handleDeleteImage(
																				image.filename,
																			);
																		}}
																		className='flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform active:scale-95'
																		title='Xóa'
																	>
																		<FontAwesomeIcon
																			icon={
																				faTrash
																			}
																			className='h-4 w-4'
																		/>
																	</button>
																</div>
																<div className='absolute inset-0 hidden items-center justify-center gap-4 bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex'>
																	<button
																		onClick={(
																			e,
																		) => {
																			e.stopPropagation();
																			handleDownloadImage(
																				image.filename,
																			);
																		}}
																		className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20'
																		title='Tải xuống'
																	>
																		<FontAwesomeIcon
																			icon={
																				faDownload
																			}
																		/>
																	</button>
																	<button
																		onClick={(
																			e,
																		) => {
																			e.stopPropagation();
																			handleDeleteImage(
																				image.filename,
																			);
																		}}
																		className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20'
																		title='Xóa'
																	>
																		<FontAwesomeIcon
																			icon={
																				faTrash
																			}
																		/>
																	</button>
																</div>
															</div>
															<div className='flex flex-col space-y-1 p-4'>
																<p
																	className='truncate text-sm font-medium text-purple-900'
																	title={
																		image.filename
																	}
																>
																	{
																		image.filename
																	}
																</p>
																<p
																	className='text-xs text-purple-500'
																	title={
																		image.created
																	}
																>
																	Ngày tạo:{' '}
																	{
																		image.created
																	}
																</p>
															</div>
														</div>
													</div>
												))}
										</div>

										{images.length === 0 && (
											<div className='flex flex-col items-center justify-center py-12'>
												<FontAwesomeIcon
													icon={faImage}
													className='mb-4 text-4xl text-pink-500'
												/>
												<p className='text-lg text-purple-600'>
													Chưa có hình ảnh nào
												</p>
											</div>
										)}

										{Math.ceil(
											images.length / imagesPerPage,
										) > 1 && (
											<div className='mt-6 flex flex-wrap justify-center gap-2'>
												{Array.from({
													length: Math.ceil(
														images.length /
															imagesPerPage,
													),
												}).map((_, i) => (
													<button
														key={`page-${i + 1}`}
														onClick={() =>
															setCurrentPage(
																i + 1,
															)
														}
														className={`min-w-[2.5rem] rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
															currentPage ===
															i + 1
																? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
																: 'text-purple-600 hover:bg-purple-50'
														}`}
													>
														{i + 1}
													</button>
												))}
											</div>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</main>
			</div>

			{editUser && (
				<div className='fixed inset-0 z-[200] flex items-center justify-center p-4'>
					<div
						className='absolute inset-0 bg-purple-900/30 backdrop-blur-md'
						onClick={() => setEditUser(null)}
					/>
					<div className='relative w-full max-w-md animate-fade-in'>
						<div className='overflow-hidden rounded-3xl bg-white/10 p-1 backdrop-blur-lg'>
							<div className='relative rounded-2xl bg-white p-8 shadow-2xl'>
								<div className='absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 opacity-20 blur-lg' />
								<div className='absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-500 opacity-20 blur-lg' />

								<h3 className='mb-6 text-xl font-semibold text-purple-900'>
									VPS - {editUser.name}
								</h3>

								{isLoading ? (
									<div className='flex justify-center py-8'>
										<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600' />
									</div>
								) : (
									<div className='space-y-4'>
										<div>
											<label className='mb-1 block text-sm font-medium text-purple-700'>
												Tên Đăng Nhập
											</label>
											<input
												type='text'
												value={editUser.username}
												onChange={(e) =>
													setEditUser({
														...editUser,
														username:
															e.target.value,
													})
												}
												className='w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3.5 text-sm text-purple-900 transition-all duration-200 ease-in-out placeholder:text-purple-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
											/>
										</div>
										<div className='relative'>
											<label className='mb-1 block text-sm font-medium text-purple-700'>
												Mật Khẩu
											</label>
											<div className='relative'>
												<input
													type={
														showEditPassword
															? 'text'
															: 'password'
													}
													value={editUser.password}
													onChange={(e) =>
														setEditUser({
															...editUser,
															password:
																e.target.value,
														})
													}
													className='w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3.5 pr-12 text-sm text-purple-900 transition-all duration-200 ease-in-out placeholder:text-purple-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200'
												/>
												<button
													type='button'
													onClick={() =>
														setShowEditPassword(
															!showEditPassword,
														)
													}
													className='absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600'
												>
													<FontAwesomeIcon
														icon={
															showEditPassword
																? faEyeSlash
																: faEye
														}
													/>
												</button>
											</div>
										</div>
										<div className='flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end sm:space-x-4'>
											<button
												onClick={() =>
													setEditUser(null)
												}
												className='w-full rounded-xl border-2 border-purple-200 px-6 py-3 text-sm font-medium text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-50 sm:w-auto'
											>
												Hủy
											</button>
											<button
												onClick={() =>
													handleChangePassword(
														editUser.name,
														editUser.username,
														editUser.password,
													)
												}
												className='group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-[2px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 sm:w-auto'
											>
												<span className='relative block rounded-[10px] bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out group-hover:bg-none'>
													Lưu
												</span>
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{deleteConfirm.isOpen && (
				<div className='fixed inset-0 z-[200] flex items-center justify-center p-4'>
					<div
						className='absolute inset-0 bg-purple-900/30 backdrop-blur-md'
						onClick={() =>
							setDeleteConfirm({ isOpen: false, userName: '' })
						}
					/>
					<div className='relative w-full max-w-md animate-fade-in'>
						<div className='overflow-hidden rounded-3xl bg-white/10 p-1 backdrop-blur-lg'>
							<div className='relative rounded-2xl bg-white p-8 shadow-2xl'>
								<div className='absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 opacity-20 blur-lg' />
								<div className='absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-500 opacity-20 blur-lg' />

								<h3 className='mb-4 text-xl font-semibold text-purple-900'>
									Xác nhận xóa
								</h3>
								<p className='mb-6 text-purple-600'>
									Bạn có chắc chắn muốn xóa VPS "
									{deleteConfirm.userName}"?
								</p>
								<div className='flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-4'>
									<button
										onClick={() =>
											setDeleteConfirm({
												isOpen: false,
												userName: '',
											})
										}
										className='rounded-xl border-2 border-purple-200 px-6 py-3 text-sm font-medium text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-50'
									>
										Hủy
									</button>
									<button
										onClick={confirmDelete}
										className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-[2px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
									>
										<span className='relative block rounded-[10px] bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out group-hover:bg-none'>
											Xóa
										</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{deleteImageConfirm.isOpen && (
				<div className='fixed inset-0 z-[200] flex items-center justify-center p-4'>
					<div
						className='absolute inset-0 bg-purple-900/30 backdrop-blur-md'
						onClick={() =>
							setDeleteImageConfirm({
								isOpen: false,
								filename: '',
							})
						}
					/>
					<div className='relative w-full max-w-md animate-fade-in'>
						<div className='overflow-hidden rounded-3xl bg-white/10 p-1 backdrop-blur-lg'>
							<div className='relative rounded-2xl bg-white p-8 shadow-2xl'>
								<div className='absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 opacity-20 blur-lg' />
								<div className='absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-500 opacity-20 blur-lg' />

								<h3 className='mb-4 text-xl font-semibold text-purple-900'>
									Xác nhận xóa
								</h3>
								<p className='mb-6 text-purple-600'>
									Bạn có chắc chắn muốn xóa{' '}
									{deleteImageConfirm.filename.includes(', ')
										? 'các'
										: ''}{' '}
									hình ảnh "{deleteImageConfirm.filename}"?
								</p>
								<div className='flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-4'>
									<button
										onClick={() =>
											setDeleteImageConfirm({
												isOpen: false,
												filename: '',
											})
										}
										className='rounded-xl border-2 border-purple-200 px-6 py-3 text-sm font-medium text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-50'
									>
										Hủy
									</button>
									<button
										onClick={confirmDeleteImage}
										className='group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-[2px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
									>
										<span className='relative block rounded-[10px] bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out group-hover:bg-none'>
											Xóa
										</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{toast.message && (
				<div className='fixed bottom-4 right-4 z-[300]'>
					<div
						className={`animate-slide-up-fade transform-gpu overflow-hidden rounded-xl bg-white/10 p-1 backdrop-blur-lg transition-all duration-500`}
					>
						<div className='relative overflow-hidden rounded-[10px] bg-white px-4 py-3 pr-12 shadow-lg'>
							<div
								className={`absolute inset-0 left-0 top-0 w-1 ${toast.type === 'success' ? 'bg-green-500' : ''} ${toast.type === 'error' ? 'bg-red-500' : ''} ${toast.type === 'info' ? 'bg-blue-500' : ''} `}
							/>

							<div className='flex items-center gap-3'>
								<div
									className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${toast.type === 'success' ? 'bg-green-100 text-green-500' : ''} ${toast.type === 'error' ? 'bg-red-100 text-red-500' : ''} ${toast.type === 'info' ? 'bg-blue-100 text-blue-500' : ''} `}
								>
									<FontAwesomeIcon
										icon={
											toast.type === 'success'
												? faCheck
												: toast.type === 'error'
													? faTimes
													: faInfo
										}
										className='h-4 w-4'
									/>
								</div>
								<p
									className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : ''} ${toast.type === 'error' ? 'text-red-800' : ''} ${toast.type === 'info' ? 'text-blue-800' : ''} `}
								>
									{toast.message}
								</p>
							</div>

							<button
								onClick={() =>
									setToast({ message: null, type: 'info' })
								}
								className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors ${toast.type === 'success' ? 'text-green-500 hover:bg-green-50' : ''} ${toast.type === 'error' ? 'text-red-500 hover:bg-red-50' : ''} ${toast.type === 'info' ? 'text-blue-500 hover:bg-blue-50' : ''} `}
							>
								<FontAwesomeIcon
									icon={faTimes}
									className='h-4 w-4'
								/>
							</button>
						</div>
					</div>
				</div>
			)}

			{imageModal.isOpen && imageModal.image && (
				<div className='fixed inset-0 z-[200] flex items-center justify-center p-4'>
					<div
						className='absolute inset-0 bg-purple-900/30 backdrop-blur-md'
						onClick={() =>
							setImageModal({ isOpen: false, image: null })
						}
					/>
					<div className='relative h-full w-full max-w-7xl animate-fade-in'>
						<div className='flex h-full items-center justify-center'>
							<div className='relative w-full overflow-hidden rounded-3xl bg-white/10 p-1 backdrop-blur-lg'>
								<div className='relative rounded-2xl bg-white p-6 shadow-2xl'>
									<div className='absolute right-4 top-4 z-10 transform'>
										<button
											onClick={() =>
												setImageModal({
													isOpen: false,
													image: null,
												})
											}
											className='group flex h-12 w-12 border-collapse items-center justify-center rounded-full border border-purple-200 bg-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-purple-50 hover:shadow-xl'
										>
											<FontAwesomeIcon
												icon={faTimes}
												className='h-5 w-5 text-purple-600 transition-colors group-hover:text-purple-700'
											/>
										</button>
									</div>

									<div className='relative mx-auto max-h-[75vh] overflow-hidden rounded-lg'>
										{imageModal.image && (
											<img
												src={
													imageModal.image.url +
													'?token=' +
													token
												}
												alt={imageModal.image.filename}
												className='max-h-[75vh] w-full object-contain'
												style={{
													maxWidth: '100%',
													height: 'auto',
													display: 'block',
													margin: '0 auto',
												}}
											/>
										)}
									</div>

									<div className='mt-6 flex items-center justify-between px-2'>
										<div className='flex-1 pr-4'>
											<h3 className='truncate text-lg font-semibold text-purple-900'>
												{imageModal.image.filename}
											</h3>
											<p className='text-sm text-purple-500'>
												Ngày tạo:{' '}
												{imageModal.image.created}
											</p>
										</div>
										{imageModal.image && (
											<button
												onClick={() =>
													handleDownloadImage(
														imageModal.image
															?.filename ?? '',
													)
												}
												className='group relative hidden flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 p-[2px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 sm:flex'
											>
												<span className='relative flex items-center rounded-[10px] bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 ease-in-out group-hover:bg-none'>
													<FontAwesomeIcon
														icon={faDownload}
														className='mr-2'
													/>
													Tải xuống
												</span>
											</button>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BestAdmin;
