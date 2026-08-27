import React from 'react';

const Title = ({ text1, text2, subtitle }) => {
  return (
    <div className='inline-flex flex-col items-center justify-center gap-1.5 mb-6 text-center'>
      <div className='inline-flex items-center gap-3'>
        <span className='w-6 sm:w-10 h-[1px] bg-zinc-300'></span>
        <h2 className='text-zinc-500 font-light tracking-[0.2em] text-xs sm:text-sm uppercase'>
          {text1}{' '}
          <span className='font-semibold text-zinc-950 tracking-[0.2em]'>{text2}</span>
        </h2>
        <span className='w-6 sm:w-10 h-[1px] bg-zinc-300'></span>
      </div>
      {subtitle && (
        <p className='text-xs text-zinc-500 max-w-md font-light tracking-wide'>{subtitle}</p>
      )}
    </div>
  );
};

export default Title;

