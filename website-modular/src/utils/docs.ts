import type { FrontMatter } from './types';
import yaml from 'yaml';

export const extractFrontMatter = (
    content: string,
): { frontMatter?: FrontMatter; content: string } => {
    const frontMatterRegex = /^---[\s\S]*?---/;
    const frontMatterMatches = content.match(frontMatterRegex);

    if (!frontMatterMatches) {
        return { content };
    }

    const frontMatterString = frontMatterMatches[0].replace(/---/g, '').trim();
    const rest = content.replace(frontMatterRegex, '');
    return { frontMatter: yaml.parse(frontMatterString), content: rest };
};
