import React, { useState, useContext, createContext } from 'react';

interface DropdownMenuContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextProps | undefined>(undefined);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactElement;
}

export function DropdownMenuTrigger({ asChild, children, ...props }: DropdownMenuTriggerProps) {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  }
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    context.setOpen(!context.open);
    if (props.onClick) props.onClick(e);
  };
  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick });
  }
  return <div {...props} onClick={handleClick}>{children}</div>;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
}

export function DropdownMenuContent({ align = 'start', children }: DropdownMenuContentProps) {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuContent must be used within DropdownMenu');
  }
  if (!context.open) return null;
  const alignmentClass = align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 transform -translate-x-1/2' : 'left-0';
  return (
    <div className={`absolute ${alignmentClass} bg-white dark:bg-gray-800 shadow-lg rounded mt-1 z-10`}>
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

export function DropdownMenuItem({ onClick, children }: DropdownMenuItemProps) {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenuItem must be used within DropdownMenu');
  }
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) onClick(e);
    context.setOpen(false);
  };
  return (
    <div onClick={handleClick} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
      {children}
    </div>
  );
}
