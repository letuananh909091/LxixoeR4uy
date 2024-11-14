import Toast from '@components/Toast';
import {
	faDownload,
	faEdit,
	faEye,
	faEyeSlash,
	faImage,
	faPlus,
	faSearch,
	faSignOutAlt,
	faSortDown,
	faSortUp,
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
	const [toast, setToast] = useState<string | null>(null);
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
			setToast('Vui lòng nhập tên VPS');
			vpsNameInputRef.current?.focus();
			return;
		}

		if (vpsCount >= 35) {
			setToast(
				'Không đủ VPS để khởi tạo, vui lòng xoá hoặc mua thêm VPS',
			);
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
			setToast('Không thể thêm VPS');
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
			setToast('Không thể tải hình ảnh');
		}
	}, [token]);

	const handleDeleteImage = async (filename: string) => {
		setDeleteImageConfirm({ isOpen: true, filename });
	};

	const confirmDeleteImage = async () => {
		try {
			await axios.post(
				'/api/delete-image',
				{ filename: deleteImageConfirm.filename },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setDeleteImageConfirm({ isOpen: false, filename: '' });
			fetchImages();
			setToast('Xóa hình ảnh thành công');
		} catch (error) {
			console.error('Failed to delete image:', error);
			setToast('Không thể xóa hình ảnh');
		}
	};

	const handleDownloadImage = async (filename: string) => {
		try {
			const response = await axios.get(`/uploads/${filename}`, {
				headers: { Authorization: `Bearer ${token}` },
				responseType: 'blob',
			});

			// Create download link
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', filename);
			document.body.appendChild(link);
			link.click();

			// Cleanup
			link.parentNode?.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Failed to download image:', error);
			setToast('Không thể tải hình ảnh');
		}
	};

	useEffect(() => {
		if (activeTab === 'images') {
			fetchImages();
		}
	}, [activeTab, fetchImages]);

	return (
		<div className='hidden min-h-screen bg-gray-100 sm:block'>
			<nav className='bg-white shadow-lg'>
				<div className='mx-auto max-w-7xl px-4'>
					<div className='flex h-16 justify-between'>
						<div className='flex space-x-8'>
							<button
								onClick={() => setActiveTab('vps')}
								className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
									activeTab === 'vps'
										? 'border-gray-700 text-gray-900'
										: 'border-transparent text-gray-500 hover:text-gray-700'
								}`}
							>
								<FontAwesomeIcon
									icon={faUsers}
									className='mr-2'
								/>
								Danh Sách VPS
							</button>
							<button
								onClick={() => setActiveTab('profile')}
								className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
									activeTab === 'profile'
										? 'border-gray-700 text-gray-900'
										: 'border-transparent text-gray-500 hover:text-gray-700'
								}`}
							>
								<FontAwesomeIcon
									icon={faUser}
									className='mr-2'
								/>
								Tài Khoản
							</button>
							<button
								onClick={() => setActiveTab('images')}
								className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
									activeTab === 'images'
										? 'border-gray-700 text-gray-900'
										: 'border-transparent text-gray-500 hover:text-gray-700'
								}`}
							>
								<FontAwesomeIcon
									icon={faImage}
									className='mr-2'
								/>
								Hình Ảnh
							</button>
						</div>
						<div className='flex items-center'>
							<button
								onClick={handleLogout}
								className='items-center rounded-md border border-transparent bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700'
							>
								<FontAwesomeIcon
									icon={faSignOutAlt}
									className='mr-2'
								/>
								Đăng Xuất
							</button>
						</div>
					</div>
				</div>
			</nav>
			<div className='mx-auto max-w-7xl py-6 sm:px-6 lg:px-8'>
				{activeTab === 'vps' ? (
					<div className='rounded-lg bg-white p-6 shadow'>
						<div className='mb-6'>
							<div className='mb-4 flex items-center gap-4'>
								<div className='relative flex-1'>
									<FontAwesomeIcon
										icon={faSearch}
										className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
									/>
									<input
										type='text'
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
										placeholder='Tìm kiếm VPS... (Tên VPS, Tên Đăng Nhập, IP)'
										className='w-full rounded-lg border-gray-400 py-2.5 pl-10 pr-4 text-sm ring-1 ring-gray-400 transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:ring-gray-800 focus:ring-offset-2'
										autoComplete='off'
									/>
								</div>
							</div>

							<div className='flex gap-4'>
								<input
									ref={vpsNameInputRef}
									type='text'
									value={newVPSName}
									onChange={(e) =>
										setNewVPSName(e.target.value)
									}
									placeholder='Tên VPS'
									required
									className='flex-1 rounded-lg border-gray-400 px-4 py-2.5 text-sm ring-1 ring-gray-400 transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:ring-gray-800 focus:ring-offset-2'
									autoFocus
								/>
								<button
									onClick={handleAddUser}
									disabled={vpsCount >= 35}
									className={`inline-flex items-center rounded-lg px-6 py-2.5 text-sm font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 ${
										vpsCount >= 35
											? 'cursor-not-allowed bg-gray-400 text-white'
											: 'bg-gray-600 text-white hover:bg-gray-700'
									}`}
								>
									<FontAwesomeIcon
										icon={faPlus}
										className='mr-2'
									/>
									Khởi Tạo VPS {vpsCount + 1}
								</button>
							</div>
						</div>

						<div className='mt-8'>
							<h2 className='mb-4 text-lg font-semibold'>
								Danh Sách VPS
							</h2>
							<div className='overflow-x-auto'>
								{users.length > 0 ? (
									<>
										{sortUsers(filterUsers(users)).length >
										0 ? (
											<table className='min-w-full divide-y divide-gray-200'>
												<thead className='bg-gray-50'>
													<tr>
														<th
															onClick={() =>
																handleSort(
																	'stt',
																)
															}
															className='cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
														>
															<div className='flex items-center'>
																STT
																{sortField ===
																	'stt' && (
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
														{(
															[
																'name',
																'username',
															] as const
														).map((field) => (
															<th
																key={field}
																onClick={() =>
																	handleSort(
																		field,
																	)
																}
																className='cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
															>
																<div className='flex items-center'>
																	{field ===
																	'name'
																		? 'Tên'
																		: 'Tên Đăng Nhập'}
																	{sortField ===
																		field && (
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
														))}
														<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
															Mật Khẩu
														</th>
														<th
															onClick={() =>
																handleSort('ip')
															}
															className='cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
														>
															<div className='flex items-center'>
																IP
																{sortField ===
																	'ip' && (
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
														<th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
															Thao Tác
														</th>
													</tr>
												</thead>
												<tbody className='divide-y divide-gray-200 bg-white'>
													{sortUsers(
														filterUsers(users),
													).map((user, index) => (
														<tr key={user.name}>
															<td className='whitespace-nowrap px-6 py-4'>
																<b>
																	{index + 1}
																</b>
															</td>
															<td className='whitespace-nowrap px-6 py-4'>
																{user.name}
															</td>
															<td className='whitespace-nowrap px-6 py-4'>
																{user.username}
															</td>
															<td className='whitespace-nowrap px-6 py-4'>
																{user.password}
															</td>
															<td className='whitespace-nowrap px-6 py-4'>
																{user.ip}
															</td>
															<td className='whitespace-nowrap px-6 py-4'>
																<button
																	onClick={() =>
																		handleEditUser(
																			user,
																		)
																	}
																	className='mr-4 text-gray-600 hover:text-gray-900'
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
																	className='text-gray-600 hover:text-gray-900'
																	title='Xóa'
																>
																	<FontAwesomeIcon
																		icon={
																			faTrash
																		}
																	/>
																</button>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										) : (
											<div className='flex flex-col items-center justify-center py-12 text-gray-500'>
												<FontAwesomeIcon
													icon={faSearch}
													className='mb-4 text-4xl'
												/>
												<p className='text-lg'>
													Không tìm thấy VPS
												</p>
											</div>
										)}
									</>
								) : (
									<div className='flex flex-col items-center justify-center py-12 text-gray-500'>
										<FontAwesomeIcon
											icon={faUsers}
											className='mb-4 text-4xl'
										/>
										<p className='text-lg'>
											Chưa có VPS nào được khởi tạo
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				) : activeTab === 'profile' ? (
					<div className='rounded-lg bg-white p-6 shadow'>
						<h2 className='mb-4 text-lg font-semibold'>
							Thay Đổi Thông Tin Tài Khoản
						</h2>
						<div className='space-y-4'>
							<div>
								<label className='mb-1 block text-sm font-medium text-gray-700'>
									Tên Đăng Nhập
								</label>
								<input
									type='text'
									value={myUsername}
									onChange={(e) =>
										setMyUsername(e.target.value)
									}
									className='w-full rounded-lg border-gray-400 px-4 py-2.5 text-sm transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2'
								/>
							</div>
							<div className='relative'>
								<label className='mb-1 block text-sm font-medium text-gray-700'>
									Mật Khẩu
								</label>
								<div className='relative'>
									<input
										type={
											showMyPassword ? 'text' : 'password'
										}
										value={myPassword}
										onChange={(e) =>
											setMyPassword(e.target.value)
										}
										className='w-full rounded-lg border-gray-400 px-4 py-2.5 text-sm transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2'
									/>
									<button
										type='button'
										onClick={() =>
											setShowMyPassword(!showMyPassword)
										}
										className='absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-600 hover:text-gray-900'
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
								className='inline-flex items-center rounded-lg bg-gray-600 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2'
							>
								Lưu Thay Đổi
							</button>
						</div>
					</div>
				) : (
					<div className='rounded-lg bg-white p-6 shadow'>
						<h2 className='mb-4 text-lg font-semibold'>
							Quản Lý Hình Ảnh
						</h2>
						<div className='mb-6'>
							<div className='relative mb-4 flex-1'>
								<FontAwesomeIcon
									icon={faSearch}
									className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
								/>
								<input
									type='text'
									value={imageSearchTerm}
									onChange={(e) =>
										setImageSearchTerm(e.target.value)
									}
									placeholder='Tìm kiếm hình ảnh...'
									className='w-full rounded-lg border-gray-400 py-2.5 pl-10 pr-4 text-sm ring-1 ring-gray-400 transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:ring-gray-800 focus:ring-offset-2'
								/>
							</div>
						</div>

						<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
							{images
								.filter((img) =>
									img.filename
										.toLowerCase()
										.includes(
											imageSearchTerm.toLowerCase(),
										),
								)
								.slice(
									(currentPage - 1) * imagesPerPage,
									currentPage * imagesPerPage,
								)
								.map((image) => (
									<div
										key={image.filename}
										className='group relative flex flex-col rounded-lg bg-gray-50 p-2 shadow-sm transition-shadow hover:shadow-md'
									>
										<div className='aspect-w-1 aspect-h-1 relative mb-2 w-full overflow-hidden rounded-lg bg-gray-200'>
											<img
												src={image.url}
												alt={image.filename}
												className='h-full w-full object-cover object-center'
											/>
											<div className='absolute inset-0 flex items-center justify-center gap-4 bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100'>
												<button
													onClick={() =>
														handleDownloadImage(
															image.filename,
														)
													}
													className='p-2 text-white transition-colors hover:text-gray-300'
													title='Tải xuống'
												>
													<FontAwesomeIcon
														icon={faDownload}
														size='lg'
													/>
												</button>
												<button
													onClick={() =>
														handleDeleteImage(
															image.filename,
														)
													}
													className='p-2 text-white transition-colors hover:text-gray-300'
													title='Xóa'
												>
													<FontAwesomeIcon
														icon={faTrash}
														size='lg'
													/>
												</button>
											</div>
										</div>
										<div className='flex flex-col space-y-1 px-1'>
											<p
												className='truncate text-sm font-medium text-gray-700'
												title={image.filename}
											>
												{image.filename}
											</p>
											<div className='flex flex-col space-y-0.5 text-xs text-gray-500'>
												<p title={image.created}>
													Ngày tạo: {image.created}
												</p>
											</div>
										</div>
									</div>
								))}
						</div>

						{/* Pagination */}
						{Math.ceil(images.length / imagesPerPage) > 1 && (
							<div className='mt-6 flex justify-center'>
								<nav className='flex items-center space-x-2'>
									{Array.from({
										length: Math.ceil(
											images.length / imagesPerPage,
										),
									}).map((_, index) => (
										<button
											key={index}
											onClick={() =>
												setCurrentPage(index + 1)
											}
											className={`rounded-md px-3 py-1 ${
												currentPage === index + 1
													? 'bg-gray-600 text-white'
													: 'text-gray-600 hover:bg-gray-100'
											}`}
										>
											{index + 1}
										</button>
									))}
								</nav>
							</div>
						)}

						{images.length === 0 && (
							<div className='flex flex-col items-center justify-center py-12 text-gray-500'>
								<FontAwesomeIcon
									icon={faImage}
									className='mb-4 text-4xl'
								/>
								<p className='text-lg'>Chưa có hình ảnh nào</p>
							</div>
						)}

						{deleteImageConfirm.isOpen && (
							<div className='fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75'>
								<div className='w-full max-w-md rounded-lg bg-white p-6'>
									<h3 className='mb-4 text-lg font-semibold text-gray-900'>
										Xác nhận xóa
									</h3>
									<p className='mb-6 text-gray-600'>
										Bạn có chắc chắn muốn xóa hình ảnh "
										{deleteImageConfirm.filename}"?
									</p>
									<div className='flex justify-end space-x-4'>
										<button
											onClick={() =>
												setDeleteImageConfirm({
													isOpen: false,
													filename: '',
												})
											}
											className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
										>
											Hủy
										</button>
										<button
											onClick={confirmDeleteImage}
											className='rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700'
										>
											Xóa
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
			{editUser && (
				<div className='fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75'>
					<div className='w-full max-w-md rounded-lg bg-white p-6'>
						<h3 className='mb-4 text-lg font-semibold'>
							VPS - {editUser.name}
						</h3>
						{isLoading ? (
							<div className='flex justify-center py-4'>
								<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-600'></div>
							</div>
						) : (
							<div className='space-y-4'>
								<div>
									<label className='mb-1 block text-sm font-medium text-gray-700'>
										Tên Đăng Nhập
									</label>
									<input
										type='text'
										value={editUser.username}
										onChange={(e) =>
											setEditUser({
												...editUser,
												username: e.target.value,
											})
										}
										className='w-full rounded-lg border-gray-400 px-4 py-2.5 text-sm transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2'
									/>
								</div>
								<div className='relative'>
									<label className='mb-1 block text-sm font-medium text-gray-700'>
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
													password: e.target.value,
												})
											}
											className='w-full rounded-lg border-gray-400 px-4 py-2.5 text-sm transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2'
										/>
										<button
											type='button'
											onClick={() =>
												setShowEditPassword(
													!showEditPassword,
												)
											}
											className='absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-600 hover:text-gray-900'
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
								<div className='flex justify-end space-x-4'>
									<button
										onClick={() => setEditUser(null)}
										className='rounded-md border-2 border-gray-400 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 ease-in-out hover:border-gray-500 hover:bg-gray-50'
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
										className='rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700'
									>
										Lưu
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
			{deleteConfirm.isOpen && (
				<div className='fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75'>
					<div className='w-full max-w-md rounded-lg bg-white p-6'>
						<h3 className='mb-4 text-lg font-semibold text-gray-900'>
							Xác nhận xóa
						</h3>
						<p className='mb-6 text-gray-600'>
							Bạn có chắc chắn muốn xóa tài khoản "
							{deleteConfirm.userName}"?
						</p>
						<div className='flex justify-end space-x-4'>
							<button
								onClick={() =>
									setDeleteConfirm({
										isOpen: false,
										userName: '',
									})
								}
								className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
							>
								Hủy
							</button>
							<button
								onClick={confirmDelete}
								className='rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700'
							>
								Xóa
							</button>
						</div>
					</div>
				</div>
			)}
			{toast && <Toast message={toast} onClose={() => setToast(null)} />}
		</div>
	);
};

export default BestAdmin;
