// ====================================================================================================
// =====================================     mnemonic_utils.js     ====================================
// ====================================================================================================
"use strict";

class MnemonicUtils {
    static WordIndexToMnemonic( word_index ) {
        // console.log("> **** MnemonicUtils.WordIndexToMnemonic " + word_index );
        // console.log("   typeof word_index: " + typeof word_index );
        let word = "*none*";
        if ( word_index != undefined && word_index >=0 && word_index <=2047 ) {
            word = WORDLIST_EN[word_index];	
            // console.log("   word: " + word );
        }	
        return word;
    } // MnemonicUtils.WordIndexToMnemonic()
	
	static WordIndexesToMemonics( word_indexes ) { 
        let mnemonics = [];	
        if ( word_indexes != undefined && word_indexes.length >= 12 ) {			 
            for ( let i=0; i< word_indexes.length; i++ ) {
                let mnemonic = MnemonicUtils.WordIndexToMnemonic( word_indexes[i] );
                mnemonics.push(mnemonic);			
            }
        }
        return mnemonics;
    } // MnemonicUtils.WordIndexesToMemonics()
	
	static MnemonicToWordIndex( mnemonic ) {
        // console.log("> **** MnemonicUtils.MnemonicToWordIndex " + mnemonic );
		// console.log("   mnk2widx> mnemonic: '" + mnemonic + "'" );
        let word_index = -1;
		for ( let i=0; i < WORDLIST_EN.length; i++ ) {
			let word = WORDLIST_EN[i];			
			if ( WORDLIST_EN[i] == mnemonic ) {
				word_index = i;
				break;
            }	
        }	
        return word_index;
    } // MnemonicUtils.MnemonicToWordIndex()

	static MnemonicsToWordIndexes( mnemonics ) { 
	    console.log(">> MnemonicsToWordIndexes");
		console.log("'" + mnemonics + "'");
        let words = mnemonics.split(' ');	
		let word_indexes = [];	
		for ( let i=0; i < words.length; i++ ) {
			let mnemonic = words[i]; 
			// console.log("   mnks2widxs> mnemonic[" + i + "]: " + mnemonic + "'" );
			let word_index = MnemonicUtils.MnemonicToWordIndex( mnemonic );
			if ( word_index == -1 ) {
				break;
            }	
			word_indexes.push( word_index );
        }	
        return word_indexes;
    } // MnemonicUtils.MnemonicsToWordIndexes()
} // MnemonicUtils class