import React from 'react';
import { JumpToTop } from '@invertase/ui';
import cx from 'classnames';

function ToTop() {
  return (
    <JumpToTop>
      {(distance, jump) => (
        <div
          role="button"
          onClick={() => jump()}
          className={cx(
            'fixed transition-opacity duration-200 inset-x-0 bottom-0 z-40 w-40 mx-auto mb-4 bg-gray-900 rounded-lg text-white text-center py-2 uppercase text-xs',
            {
              'opacity-0 pointer-events-none': distance < 300,
              'opacity-50 hover:opacity-100 shadow-lg pointer-events-auto':
                distance >= 300,
            }
          )}
        >
          Jump to top
        </div>
      )}
    </JumpToTop>
  );
}

export { ToTop };
