'use client';

import React from 'react';

type StyledComponentsRegistryProps = {
  children: React.ReactNode;
};

export const StyledComponentsRegistry = ({
  children,
}: StyledComponentsRegistryProps) => {
  return <>{children}</>;
};

export default StyledComponentsRegistry;
