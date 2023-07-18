import Avatar from './Avatar';

const Contact = ({
  userId,
  onClick,
  isSelected,
  username,
  online,
}: {
  userId: string;
  onClick: (id: string) => void;
  isSelected: boolean;
  username: string;
  online: boolean;
}) => {
  return (
    <div
      key={userId}
      className={
        'border-b border-gray-100 flex items-center gap-2 cursor-pointer ' +
        (isSelected ? 'bg-blue-50' : '')
      }
      onClick={() => onClick(userId)}
    >
      {isSelected && <div className='w-1 bg-blue-500 h-12 rounded-r-md'></div>}
      <div className='flex items-center gap-2 py-2 pl-4'>
        <Avatar online={online} userId={userId} username={username} />
        <span className='text-green-800'>{username}</span>
      </div>
    </div>
  );
};

export default Contact;
